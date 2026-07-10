const dayjs = require("dayjs");
const { Op } = require("sequelize");
const { sequelize, SavingAccount, SavingTransaction, Customer, Transaction } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { genSavingCode, genReceiptNo } = require("../utils/codeGenerator");
const {
  calcMaturityInterest,
  calcEarlyWithdrawPenalty,
  round2,
} = require("../utils/interest");
const {
  SAVING_STATUS,
  SAVING_TERM_MONTHS,
  TRANSACTION_TYPE,
  AUDIT_ACTION,
} = require("../config/constants");
const auditService = require("./auditService");
const notificationService = require("./notificationService");
const interestService = require("./interestService");
const configService = require("./configService");

async function list({ page, size, offset }, filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.customerId) where.customer_id = filters.customerId;
  if (filters.keyword) {
    where[Op.or] = [{ saving_code: { [Op.like]: `%${filters.keyword}%` } }];
  }
  return SavingAccount.findAndCountAll({
    where,
    include: [{ model: Customer, as: "customer", attributes: ["id", "full_name", "customer_code", "phone"] }],
    order: [["created_at", "DESC"]],
    limit: size,
    offset,
  });
}

async function getById(id) {
  const account = await SavingAccount.findByPk(id, {
    include: [
      { model: Customer, as: "customer" },
      { model: SavingTransaction, as: "transactions", separate: true, order: [["created_at", "DESC"]] },
    ],
  });
  if (!account) throw new AppError(404, "Không tìm thấy tài khoản tiết kiệm.", "ResourceNotFoundException");
  return account;
}

async function open(payload, actor) {
  const customer = await Customer.findByPk(payload.customer_id);
  if (!customer) throw new AppError(404, "Không tìm thấy khách hàng.", "ResourceNotFoundException");
  if (!payload.amount || payload.amount <= 0) {
    throw new AppError(400, "Số tiền gửi phải lớn hơn 0.", "ValidationException");
  }

  const rate = await interestService.getActiveRate("SAVING", payload.saving_type);
  const termMonths = SAVING_TERM_MONTHS[payload.saving_type] ?? 0;
  const openDate = payload.open_date || dayjs().format("YYYY-MM-DD");
  const maturityDate = termMonths > 0 ? dayjs(openDate).add(termMonths, "month").format("YYYY-MM-DD") : null;

  return sequelize.transaction(async (t) => {
    const account = await SavingAccount.create(
      {
        saving_code: genSavingCode(),
        customer_id: payload.customer_id,
        saving_type: payload.saving_type,
        principal: payload.amount,
        balance: payload.amount,
        interest_rate: rate.rate_percent_per_year,
        term_months: termMonths,
        open_date: openDate,
        maturity_date: maturityDate,
        status: SAVING_STATUS.ACTIVE,
        auto_renew: !!payload.auto_renew,
        created_by: actor.id,
      },
      { transaction: t }
    );

    await SavingTransaction.create(
      {
        saving_account_id: account.id,
        type: "DEPOSIT",
        amount: payload.amount,
        balance_after: payload.amount,
        note: "Mở tài khoản tiết kiệm",
        performed_by: actor.id,
      },
      { transaction: t }
    );

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.DEPOSIT,
        customer_id: payload.customer_id,
        reference_code: account.saving_code,
        amount: payload.amount,
        description: `Mở sổ tiết kiệm ${account.saving_code}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.OPEN_SAVING,
      description: `Mở sổ tiết kiệm ${account.saving_code} - số tiền ${payload.amount.toLocaleString()} VND.`,
      entityType: "SavingAccount",
      entityId: account.id,
    });

    return account;
  });
}

async function deposit(id, { amount, note }, actor) {
  if (!amount || amount <= 0) throw new AppError(400, "Số tiền gửi phải lớn hơn 0.", "ValidationException");

  return sequelize.transaction(async (t) => {
    const account = await SavingAccount.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account) throw new AppError(404, "Không tìm thấy tài khoản tiết kiệm.", "ResourceNotFoundException");
    if (account.status !== SAVING_STATUS.ACTIVE) {
      throw new AppError(400, "Tài khoản không ở trạng thái hoạt động.", "BusinessException");
    }

    account.balance = round2(account.balance + amount);
    await account.save({ transaction: t });

    await SavingTransaction.create(
      {
        saving_account_id: account.id,
        type: "DEPOSIT",
        amount,
        balance_after: account.balance,
        note,
        performed_by: actor.id,
      },
      { transaction: t }
    );

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.DEPOSIT,
        customer_id: account.customer_id,
        reference_code: account.saving_code,
        amount,
        description: note || `Gửi tiền vào ${account.saving_code}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.DEPOSIT,
      description: `Gửi tiền ${amount.toLocaleString()} VND vào ${account.saving_code}.`,
      entityType: "SavingAccount",
      entityId: account.id,
    });

    return account;
  });
}

async function withdraw(id, { amount, note }, actor) {
  if (!amount || amount <= 0) throw new AppError(400, "Số tiền rút phải lớn hơn 0.", "ValidationException");

  return sequelize.transaction(async (t) => {
    const account = await SavingAccount.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account) throw new AppError(404, "Không tìm thấy tài khoản tiết kiệm.", "ResourceNotFoundException");
    if (account.status !== SAVING_STATUS.ACTIVE) {
      throw new AppError(400, "Tài khoản không ở trạng thái hoạt động.", "BusinessException");
    }
    if (amount > account.balance) {
      throw new AppError(400, "Số dư khả dụng không đủ.", "BusinessException");
    }
    if (account.term_months > 0 && account.maturity_date && dayjs().isBefore(dayjs(account.maturity_date))) {
      throw new AppError(400, "Tài khoản có kỳ hạn chưa đến ngày đáo hạn. Vui lòng dùng chức năng tất toán trước hạn.", "BusinessException");
    }

    account.balance = round2(account.balance - amount);
    await account.save({ transaction: t });

    await SavingTransaction.create(
      {
        saving_account_id: account.id,
        type: "WITHDRAW",
        amount,
        balance_after: account.balance,
        note,
        performed_by: actor.id,
      },
      { transaction: t }
    );

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.WITHDRAW,
        customer_id: account.customer_id,
        reference_code: account.saving_code,
        amount,
        description: note || `Rút tiền từ ${account.saving_code}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.WITHDRAW,
      description: `Rút tiền ${amount.toLocaleString()} VND từ ${account.saving_code}.`,
      entityType: "SavingAccount",
      entityId: account.id,
    });

    return account;
  });
}

/**
 * Tất toán sổ tiết kiệm - FR-016.
 * Tính lãi (đáo hạn nếu đủ kỳ hạn, hoặc phạt trước hạn nếu tất toán sớm).
 */
async function close(id, { note }, actor) {
  return sequelize.transaction(async (t) => {
    const account = await SavingAccount.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account) throw new AppError(404, "Không tìm thấy tài khoản tiết kiệm.", "ResourceNotFoundException");
    if (account.status !== SAVING_STATUS.ACTIVE) {
      throw new AppError(400, "Tài khoản không ở trạng thái hoạt động.", "BusinessException");
    }

    const today = dayjs();
    let interest = 0;
    let penalty = 0;
    const isFullTerm = account.term_months === 0 || (account.maturity_date && !today.isBefore(dayjs(account.maturity_date)));

    if (account.term_months === 0) {
      // Không kỳ hạn: tính lãi đơn giản theo số ngày thực gửi
      const days = today.diff(dayjs(account.open_date), "day");
      interest = round2(account.principal * (account.interest_rate / 100 / 365) * days);
    } else if (isFullTerm) {
      interest = calcMaturityInterest(account.principal, account.interest_rate, account.term_months);
    } else {
      const days = today.diff(dayjs(account.open_date), "day");
      const result = calcEarlyWithdrawPenalty(account.principal, account.interest_rate, days, account.term_months);
      interest = result.earnedInterest;
      penalty = result.penalty;
    }

    const totalPayout = round2(account.balance + interest);

    account.status = SAVING_STATUS.CLOSED;
    account.closed_date = today.format("YYYY-MM-DD");
    account.accumulated_interest_paid = interest;
    account.balance = 0;
    await account.save({ transaction: t });

    await SavingTransaction.create(
      {
        saving_account_id: account.id,
        type: "CLOSE",
        amount: totalPayout,
        balance_after: 0,
        note: note || `Tất toán - lãi: ${interest.toLocaleString()} VND${penalty ? `, phạt trước hạn: ${penalty.toLocaleString()} VND` : ""}`,
        performed_by: actor.id,
      },
      { transaction: t }
    );

    await Transaction.create(
      {
        receipt_no: genReceiptNo(),
        type: TRANSACTION_TYPE.SAVING_CLOSE,
        customer_id: account.customer_id,
        reference_code: account.saving_code,
        amount: totalPayout,
        description: `Tất toán sổ tiết kiệm ${account.saving_code}`,
        performed_by: actor.id,
        transaction_date: new Date(),
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.CLOSE_SAVING,
      description: `Tất toán ${account.saving_code}. Gốc: ${account.principal.toLocaleString()}, Lãi: ${interest.toLocaleString()}, Phạt: ${penalty.toLocaleString()}.`,
      entityType: "SavingAccount",
      entityId: account.id,
    });

    return { account, interest, penalty, totalPayout, isFullTerm };
  });
}

/**
 * Tái tục sổ tiết kiệm - FR-017: tự động gia hạn kỳ hạn + cập nhật lãi suất hiện hành.
 */
async function renew(id, actor) {
  return sequelize.transaction(async (t) => {
    const account = await SavingAccount.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account) throw new AppError(404, "Không tìm thấy tài khoản tiết kiệm.", "ResourceNotFoundException");
    if (account.status !== SAVING_STATUS.ACTIVE) {
      throw new AppError(400, "Chỉ có thể tái tục tài khoản đang hoạt động.", "BusinessException");
    }
    if (account.term_months === 0) {
      throw new AppError(400, "Tài khoản không kỳ hạn không thể tái tục.", "BusinessException");
    }

    // Nhập gốc + lãi đáo hạn vào sổ mới
    const interest = calcMaturityInterest(account.principal, account.interest_rate, account.term_months);
    const rate = await interestService.getActiveRate("SAVING", account.saving_type);

    account.principal = round2(account.principal + interest);
    account.balance = account.principal;
    account.interest_rate = rate.rate_percent_per_year;
    account.open_date = dayjs().format("YYYY-MM-DD");
    account.maturity_date = dayjs().add(account.term_months, "month").format("YYYY-MM-DD");
    account.accumulated_interest_paid = round2(account.accumulated_interest_paid + interest);
    await account.save({ transaction: t });

    await SavingTransaction.create(
      {
        saving_account_id: account.id,
        type: "RENEW",
        amount: interest,
        balance_after: account.balance,
        note: `Tái tục kỳ hạn ${account.term_months} tháng, nhập lãi ${interest.toLocaleString()} VND vào gốc.`,
        performed_by: actor.id,
      },
      { transaction: t }
    );

    await auditService.log({
      user: actor,
      action: AUDIT_ACTION.OPEN_SAVING,
      description: `Tái tục sổ tiết kiệm ${account.saving_code}.`,
      entityType: "SavingAccount",
      entityId: account.id,
    });

    return account;
  });
}

/**
 * Quét các sổ tiết kiệm đáo hạn để thông báo (dùng cho job định kỳ / gọi thủ công).
 */
async function checkMaturedAccounts() {
  const today = dayjs().format("YYYY-MM-DD");
  const matured = await SavingAccount.findAll({
    where: {
      status: SAVING_STATUS.ACTIVE,
      term_months: { [Op.gt]: 0 },
      maturity_date: { [Op.lte]: today },
    },
    include: [{ model: Customer, as: "customer" }],
  });

  for (const acc of matured) {
    await notificationService.notifyRole("TELLER", {
      type: "SAVING_MATURED",
      title: "Sổ tiết kiệm đáo hạn",
      message: `Sổ ${acc.saving_code} của khách hàng ${acc.customer.full_name} đã đến ngày đáo hạn.`,
      referenceCode: acc.saving_code,
    });
  }
  return matured.length;
}

module.exports = { list, getById, open, deposit, withdraw, close, renew, checkMaturedAccounts };
