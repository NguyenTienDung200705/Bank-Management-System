const dayjs = require("dayjs");
const { Op } = require("sequelize");
const {
  sequelize,
  Loan,
  LoanRepaymentSchedule,
  LoanRepayment,
  Customer,
  Transaction,
} = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { genLoanCode, genReceiptNo } = require("../utils/codeGenerator");
const { generateAmortizationSchedule, calcOverduePenalty, round2 } = require("../utils/interest");
const { LOAN_STATUS, TRANSACTION_TYPE, AUDIT_ACTION } = require("../config/constants");
const auditService = require("./auditService");
const notificationService = require("./notificationService");
const interestService = require("./interestService");
const configService = require("./configService");

async function list({ page, size, offset }, filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.customerId) where.customer_id = filters.customerId;
  if (filters.keyword) {
    where[Op.or] = [{ loan_code: { [Op.like]: `%${filters.keyword}%` } }];
  }
  return Loan.findAndCountAll({
    where,
    include: [{ model: Customer, as: "customer", attributes: ["id", "full_name", "customer_code", "phone"] }],
    order: [["created_at", "DESC"]],
    limit: size,
    offset,
  });
}

async function getById(id) {
  const loan = await Loan.findByPk(id, {
    include: [
      { model: Customer, as: "customer" },
      { model: LoanRepaymentSchedule, as: "schedules", separate: true, order: [["period_no", "ASC"]] },
      { model: LoanRepayment, as: "repayments", separate: true, order: [["created_at", "DESC"]] },
    ],
  });
  if (!loan) throw new AppError(404, "Không tìm thấy khoản vay.", "ResourceNotFoundException");
  return loan;
}

// FR-021 Apply Loan
async function apply(payload, actor) {
  const customer = await Customer.findByPk(payload.customer_id);
  if (!customer) throw new AppError(404, "Không tìm thấy khách hàng.", "ResourceNotFoundException");
  if (!payload.principal || payload.principal <= 0) {
    throw new AppError(400, "Số tiền vay phải lớn hơn 0.", "ValidationException");
  }
  if (!payload.term_months || payload.term_months <= 0) {
    throw new AppError(400, "Kỳ hạn vay không hợp lệ.", "ValidationException");
  }

  const rate = await interestService.getActiveRate("LOAN", payload.loan_type);

  const loan = await Loan.create({
    loan_code: genLoanCode(),
    customer_id: payload.customer_id,
    loan_type: payload.loan_type,
    principal: payload.principal,
    interest_rate: rate.rate_percent_per_year,
    term_months: payload.term_months,
    purpose: payload.purpose,
    status: LOAN_STATUS.PENDING,
    applied_date: dayjs().format("YYYY-MM-DD"),
    created_by: actor.id,
  });

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.LOAN_APPLY,
    description: `Khách hàng ${customer.full_name} đăng ký khoản vay ${loan.loan_code} - ${payload.principal.toLocaleString()} VND.`,
    entityType: "Loan",
    entityId: loan.id,
  });

  await notificationService.notifyRole("LOAN_OFFICER", {
    type: "SYSTEM",
    title: "Hồ sơ vay mới cần thẩm định",
    message: `Khoản vay ${loan.loan_code} của khách hàng ${customer.full_name} đang chờ duyệt.`,
    referenceCode: loan.loan_code,
  });

  return loan;
}

// FR-022 Loan Approval
async function decide(id, { approve, reason }, actor) {
  const loan = await Loan.findByPk(id, { include: [{ model: Customer, as: "customer" }] });
  if (!loan) throw new AppError(404, "Không tìm thấy khoản vay.", "ResourceNotFoundException");
  if (loan.status !== LOAN_STATUS.PENDING) {
    throw new AppError(400, "Chỉ có thể duyệt hồ sơ đang chờ xử lý.", "BusinessException");
  }

  loan.status = approve ? LOAN_STATUS.APPROVED : LOAN_STATUS.REJECTED;
  loan.approved_date = dayjs().format("YYYY-MM-DD");
  loan.reviewed_by = actor.id;
  if (!approve) loan.reject_reason = reason || "Không đạt điều kiện vay.";
  await loan.save();

  await auditService.log({
    user: actor,
    action: approve ? AUDIT_ACTION.LOAN_APPROVE : AUDIT_ACTION.LOAN_REJECT,
    description: `${approve ? "Duyệt" : "Từ chối"} khoản vay ${loan.loan_code}.`,
    entityType: "Loan",
    entityId: loan.id,
  });

  await notificationService.notifyUser(loan.created_by, {
    type: approve ? "LOAN_APPROVED" : "LOAN_REJECTED",
    title: approve ? "Khoản vay đã được duyệt" : "Khoản vay bị từ chối",
    message: `Khoản vay ${loan.loan_code} của khách hàng ${loan.customer.full_name} đã ${approve ? "được duyệt" : "bị từ chối"}.`,
    referenceCode: loan.loan_code,
  });

  return loan;
}

// FR-023 Loan Disbursement
async function disburse(id, actor) {
  return sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!loan) throw new AppError(404, "Không tìm thấy khoản vay.", "ResourceNotFoundException");
    if (loan.status !== LOAN_STATUS.APPROVED) {
      throw new AppError(400, "Khoản vay phải ở trạng thái đã duyệt mới có thể giải ngân.", "BusinessException");
    }

    const schedule = generateAmortizationSchedule({
      principal: loan.principal,
      ratePercentPerYear: loan.interest_rate,
      termMonths: loan.term_months,
      startDate: dayjs().format("YYYY-MM-DD"),
    });

    for (const period of schedule) {
      await LoanRepaymentSchedule.create({ loan_id: loan.id, ...period }, { transaction: t });
    }

    loan.status = LOAN_STATUS.DISBURSED;
    loan.disbursed_date = dayjs().format("YYYY-MM-DD");
    loan.outstanding_principal = loan.principal;
    loan.monthly_payment = schedule[0].total_due;
    await loan.save({ transaction: t });

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.LOAN_DISBURSEMENT,
        customer_id: loan.customer_id,
        reference_code: loan.loan_code,
        amount: loan.principal,
        description: `Giải ngân khoản vay ${loan.loan_code}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.LOAN_DISBURSE,
      description: `Giải ngân khoản vay ${loan.loan_code} - ${loan.principal.toLocaleString()} VND.`,
      entityType: "Loan",
      entityId: loan.id,
    });

    return loan;
  });
}

// FR-024 Loan Repayment
async function repay(id, { amount, note }, actor) {
  if (!amount || amount <= 0) throw new AppError(400, "Số tiền thanh toán phải lớn hơn 0.", "ValidationException");

  return sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!loan) throw new AppError(404, "Không tìm thấy khoản vay.", "ResourceNotFoundException");
    if (![LOAN_STATUS.DISBURSED, LOAN_STATUS.OVERDUE].includes(loan.status)) {
      throw new AppError(400, "Khoản vay không ở trạng thái có thể thanh toán.", "BusinessException");
    }

    const nextSchedule = await LoanRepaymentSchedule.findOne({
      where: { loan_id: loan.id, status: { [Op.in]: ["PENDING", "OVERDUE", "PARTIAL"] } },
      order: [["period_no", "ASC"]],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!nextSchedule) throw new AppError(400, "Khoản vay đã tất toán toàn bộ lịch trả nợ.", "BusinessException");

    // Tính phạt trễ hạn nếu quá ngày đến hạn
    const today = dayjs();
    let penaltyDue = nextSchedule.penalty_due;
    if (today.isAfter(dayjs(nextSchedule.due_date))) {
      const overdueDays = today.diff(dayjs(nextSchedule.due_date), "day");
      const penaltyRate = await configService.getNumber("LOAN_PENALTY_RATE_PER_DAY", 0.05);
      const remainingDue = round2(nextSchedule.total_due - nextSchedule.amount_paid);
      penaltyDue = calcOverduePenalty(remainingDue, penaltyRate, overdueDays);
      nextSchedule.penalty_due = penaltyDue;
    }

    const totalOwed = round2(nextSchedule.total_due + penaltyDue - nextSchedule.amount_paid);
    const payAmount = Math.min(amount, totalOwed);

    const remainingAfterPay = round2(totalOwed - payAmount);
    nextSchedule.amount_paid = round2(nextSchedule.amount_paid + payAmount);
    nextSchedule.status = remainingAfterPay <= 0 ? "PAID" : "PARTIAL";
    if (remainingAfterPay <= 0) nextSchedule.paid_date = today.format("YYYY-MM-DD");
    await nextSchedule.save({ transaction: t });

    // Phân bổ: lãi + phạt trước, gốc sau
    const interestPortion = Math.min(payAmount, nextSchedule.interest_due);
    const penaltyPortion = Math.min(Math.max(payAmount - interestPortion, 0), penaltyDue);
    const principalPortion = round2(payAmount - interestPortion - penaltyPortion);

    await LoanRepayment.create(
      {
        loan_id: loan.id,
        schedule_id: nextSchedule.id,
        principal_paid: principalPortion,
        interest_paid: interestPortion,
        penalty_paid: penaltyPortion,
        total_paid: payAmount,
        payment_date: today.format("YYYY-MM-DD"),
        performed_by: actor.id,
        note,
      },
      { transaction: t }
    );

    loan.outstanding_principal = round2(Math.max(loan.outstanding_principal - principalPortion, 0));
    await loan.save({ transaction: t });

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.LOAN_REPAYMENT,
        customer_id: loan.customer_id,
        reference_code: loan.loan_code,
        amount: payAmount,
        description: note || `Thanh toán khoản vay ${loan.loan_code} - kỳ ${nextSchedule.period_no}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.LOAN_REPAYMENT,
      description: `Thu nợ khoản vay ${loan.loan_code} - ${payAmount.toLocaleString()} VND (kỳ ${nextSchedule.period_no}).`,
      entityType: "Loan",
      entityId: loan.id,
    });

    // Kiểm tra tất toán toàn bộ
    const remainingSchedules = await LoanRepaymentSchedule.count({
      where: { loan_id: loan.id, status: { [Op.in]: ["PENDING", "OVERDUE", "PARTIAL"] } },
      transaction: t,
    });
    if (remainingSchedules === 0) {
      loan.status = LOAN_STATUS.SETTLED;
      loan.settled_date = today.format("YYYY-MM-DD");
      await loan.save({ transaction: t });
    }

    return { loan, schedule: nextSchedule, principalPortion, interestPortion, penaltyPortion };
  });
}

// FR-025 Loan Settlement (tất toán sớm toàn bộ dư nợ còn lại)
async function settle(id, actor) {
  return sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!loan) throw new AppError(404, "Không tìm thấy khoản vay.", "ResourceNotFoundException");
    if (![LOAN_STATUS.DISBURSED, LOAN_STATUS.OVERDUE].includes(loan.status)) {
      throw new AppError(400, "Khoản vay không ở trạng thái có thể tất toán.", "BusinessException");
    }

    const remainingSchedules = await LoanRepaymentSchedule.findAll({
      where: { loan_id: loan.id, status: { [Op.in]: ["PENDING", "OVERDUE", "PARTIAL"] } },
      transaction: t,
    });

    const totalSettleAmount = round2(
      remainingSchedules.reduce((sum, s) => sum + (s.total_due + s.penalty_due - s.amount_paid), 0)
    );

    for (const s of remainingSchedules) {
      s.amount_paid = s.total_due + s.penalty_due;
      s.status = "PAID";
      s.paid_date = dayjs().format("YYYY-MM-DD");
      await s.save({ transaction: t });
    }

    await LoanRepayment.create(
      {
        loan_id: loan.id,
        principal_paid: loan.outstanding_principal,
        interest_paid: round2(totalSettleAmount - loan.outstanding_principal),
        penalty_paid: 0,
        total_paid: totalSettleAmount,
        payment_date: dayjs().format("YYYY-MM-DD"),
        performed_by: actor.id,
        note: "Tất toán toàn bộ khoản vay trước hạn.",
      },
      { transaction: t }
    );

    loan.status = LOAN_STATUS.SETTLED;
    loan.settled_date = dayjs().format("YYYY-MM-DD");
    loan.outstanding_principal = 0;
    await loan.save({ transaction: t });

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.LOAN_REPAYMENT,
        customer_id: loan.customer_id,
        reference_code: loan.loan_code,
        amount: totalSettleAmount,
        description: `Tất toán khoản vay ${loan.loan_code}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.LOAN_REPAYMENT,
      description: `Tất toán khoản vay ${loan.loan_code} - ${totalSettleAmount.toLocaleString()} VND.`,
      entityType: "Loan",
      entityId: loan.id,
    });

    return { loan, totalSettleAmount };
  });
}

// FR-028 Overdue detection (chạy định kỳ hoặc thủ công)
async function detectOverdue() {
  const today = dayjs().format("YYYY-MM-DD");
  const overdueSchedules = await LoanRepaymentSchedule.findAll({
    where: { status: { [Op.in]: ["PENDING", "PARTIAL"] }, due_date: { [Op.lt]: today } },
    include: [{ model: Loan, as: "loan", include: [{ model: Customer, as: "customer" }] }],
  });

  const loanIds = new Set();
  for (const s of overdueSchedules) {
    s.status = "OVERDUE";
    await s.save();
    loanIds.add(s.loan_id);
  }

  for (const loanId of loanIds) {
    const loan = await Loan.findByPk(loanId, { include: [{ model: Customer, as: "customer" }] });
    if (loan && loan.status === LOAN_STATUS.DISBURSED) {
      loan.status = LOAN_STATUS.OVERDUE;
      await loan.save();
      await notificationService.notifyRole("LOAN_OFFICER", {
        type: "LOAN_OVERDUE",
        title: "Khoản vay quá hạn",
        message: `Khoản vay ${loan.loan_code} của khách hàng ${loan.customer.full_name} đã quá hạn thanh toán.`,
        referenceCode: loan.loan_code,
      });
    }
  }

  return { overdueSchedules: overdueSchedules.length, overdueLoans: loanIds.size };
}

async function statistics() {
  const totalLoan = (await Loan.sum("principal")) || 0;
  const outstanding = (await Loan.sum("outstanding_principal")) || 0;
  const collectedInterest = (await LoanRepayment.sum("interest_paid")) || 0;
  const countByStatus = await Loan.findAll({
    attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
    group: ["status"],
    raw: true,
  });
  return { totalLoan, outstanding, collectedInterest, countByStatus };
}

module.exports = { list, getById, apply, decide, disburse, repay, settle, detectOverdue, statistics };
