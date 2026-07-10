const dayjs = require("dayjs");
const { Op, fn, col, literal } = require("sequelize");
const {
  sequelize,
  Customer,
  SavingAccount,
  Loan,
  Transaction,
  LoanRepayment,
} = require("../models");
const { SAVING_STATUS, LOAN_STATUS, TRANSACTION_TYPE } = require("../config/constants");

async function dashboardSummary() {
  const [totalCustomers, activeSavings, totalSavingsBalance, activeLoans, totalOutstanding, overdueLoans] =
    await Promise.all([
      Customer.count(),
      SavingAccount.count({ where: { status: SAVING_STATUS.ACTIVE } }),
      SavingAccount.sum("balance", { where: { status: SAVING_STATUS.ACTIVE } }),
      Loan.count({ where: { status: [LOAN_STATUS.DISBURSED, LOAN_STATUS.OVERDUE] } }),
      Loan.sum("outstanding_principal", { where: { status: [LOAN_STATUS.DISBURSED, LOAN_STATUS.OVERDUE] } }),
      Loan.count({ where: { status: LOAN_STATUS.OVERDUE } }),
    ]);

  const todayStart = dayjs().startOf("day").toDate();
  const todayEnd = dayjs().endOf("day").toDate();
  const todayTransactions = await Transaction.count({
    where: { transaction_date: { [Op.between]: [todayStart, todayEnd] } },
  });
  const todayRevenue =
    (await Transaction.sum("amount", {
      where: {
        transaction_date: { [Op.between]: [todayStart, todayEnd] },
        type: TRANSACTION_TYPE.LOAN_REPAYMENT,
      },
    })) || 0;

  const totalInterestCollected = (await LoanRepayment.sum("interest_paid")) || 0;

  return {
    totalCustomers,
    activeSavings,
    totalSavingsBalance: totalSavingsBalance || 0,
    activeLoans,
    totalOutstanding: totalOutstanding || 0,
    overdueLoans,
    todayTransactions,
    todayRevenue,
    totalInterestCollected,
  };
}

async function revenueByMonth(months = 12) {
  const from = dayjs().subtract(months - 1, "month").startOf("month").format("YYYY-MM-DD");
  const rows = await Transaction.findAll({
    attributes: [
      [fn("strftime", "%Y-%m", col("transaction_date")), "month"],
      "type",
      [fn("SUM", col("amount")), "total"],
    ],
    where: { transaction_date: { [Op.gte]: from } },
    group: ["month", "type"],
    order: [[literal("month"), "ASC"]],
    raw: true,
  });
  return rows;
}

async function savingStatistics() {
  const byType = await SavingAccount.findAll({
    attributes: ["saving_type", [fn("COUNT", col("id")), "count"], [fn("SUM", col("balance")), "totalBalance"]],
    where: { status: SAVING_STATUS.ACTIVE },
    group: ["saving_type"],
    raw: true,
  });
  const byStatus = await SavingAccount.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });
  return { byType, byStatus };
}

async function loanStatistics() {
  const byType = await Loan.findAll({
    attributes: [
      "loan_type",
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("principal")), "totalPrincipal"],
      [fn("SUM", col("outstanding_principal")), "totalOutstanding"],
    ],
    group: ["loan_type"],
    raw: true,
  });
  const byStatus = await Loan.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });
  return { byType, byStatus };
}

async function customerStatistics() {
  const byGender = await Customer.findAll({
    attributes: ["gender", [fn("COUNT", col("id")), "count"]],
    group: ["gender"],
    raw: true,
  });
  const newThisMonth = await Customer.count({
    where: { created_at: { [Op.gte]: dayjs().startOf("month").toDate() } },
  });
  return { byGender, newThisMonth, total: await Customer.count() };
}

async function periodicReport({ from, to }) {
  const where = {
    transaction_date: { [Op.between]: [dayjs(from).startOf("day").toDate(), dayjs(to).endOf("day").toDate()] },
  };
  const totalsByType = await Transaction.findAll({
    attributes: ["type", [fn("COUNT", col("id")), "count"], [fn("SUM", col("amount")), "total"]],
    where,
    group: ["type"],
    raw: true,
  });
  const transactions = await Transaction.findAll({
    where,
    include: [{ model: Customer, as: "customer", attributes: ["full_name", "customer_code"] }],
    order: [["transaction_date", "DESC"]],
  });
  return { totalsByType, transactions, from, to };
}

module.exports = {
  dashboardSummary,
  revenueByMonth,
  savingStatistics,
  loanStatistics,
  customerStatistics,
  periodicReport,
};
