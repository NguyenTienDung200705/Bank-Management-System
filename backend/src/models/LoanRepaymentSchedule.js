const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class LoanRepaymentSchedule extends Model {}

LoanRepaymentSchedule.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loan_id: { type: DataTypes.INTEGER, allowNull: false },
    period_no: { type: DataTypes.INTEGER, allowNull: false },
    due_date: { type: DataTypes.DATEONLY, allowNull: false },
    principal_due: { type: DataTypes.FLOAT, allowNull: false },
    interest_due: { type: DataTypes.FLOAT, allowNull: false },
    penalty_due: { type: DataTypes.FLOAT, defaultValue: 0 },
    total_due: { type: DataTypes.FLOAT, allowNull: false },
    amount_paid: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "OVERDUE", "PARTIAL"),
      defaultValue: "PENDING",
    },
    paid_date: { type: DataTypes.DATEONLY },
  },
  { sequelize, modelName: "LoanRepaymentSchedule", tableName: "loan_repayment_schedules" }
);

module.exports = LoanRepaymentSchedule;
