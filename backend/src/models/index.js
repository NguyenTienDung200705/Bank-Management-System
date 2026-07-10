const sequelize = require("../config/database");

const User = require("./User");
const Customer = require("./Customer");
const InterestRate = require("./InterestRate");
const SavingAccount = require("./SavingAccount");
const SavingTransaction = require("./SavingTransaction");
const Loan = require("./Loan");
const LoanRepaymentSchedule = require("./LoanRepaymentSchedule");
const LoanRepayment = require("./LoanRepayment");
const Transaction = require("./Transaction");
const Notification = require("./Notification");
const AuditLog = require("./AuditLog");
const SystemConfig = require("./SystemConfig");

// Customer <-> SavingAccount
Customer.hasMany(SavingAccount, { foreignKey: "customer_id", as: "savingAccounts" });
SavingAccount.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// SavingAccount <-> SavingTransaction
SavingAccount.hasMany(SavingTransaction, { foreignKey: "saving_account_id", as: "transactions" });
SavingTransaction.belongsTo(SavingAccount, { foreignKey: "saving_account_id", as: "savingAccount" });

// Customer <-> Loan
Customer.hasMany(Loan, { foreignKey: "customer_id", as: "loans" });
Loan.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// Loan <-> Schedule
Loan.hasMany(LoanRepaymentSchedule, { foreignKey: "loan_id", as: "schedules" });
LoanRepaymentSchedule.belongsTo(Loan, { foreignKey: "loan_id", as: "loan" });

// Loan <-> Repayment
Loan.hasMany(LoanRepayment, { foreignKey: "loan_id", as: "repayments" });
LoanRepayment.belongsTo(Loan, { foreignKey: "loan_id", as: "loan" });

// Customer <-> Transaction
Customer.hasMany(Transaction, { foreignKey: "customer_id", as: "transactions" });
Transaction.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

module.exports = {
  sequelize,
  User,
  Customer,
  InterestRate,
  SavingAccount,
  SavingTransaction,
  Loan,
  LoanRepaymentSchedule,
  LoanRepayment,
  Transaction,
  Notification,
  AuditLog,
  SystemConfig,
};
