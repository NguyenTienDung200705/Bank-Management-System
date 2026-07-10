const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class LoanRepayment extends Model {}

LoanRepayment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loan_id: { type: DataTypes.INTEGER, allowNull: false },
    schedule_id: { type: DataTypes.INTEGER },
    principal_paid: { type: DataTypes.FLOAT, defaultValue: 0 },
    interest_paid: { type: DataTypes.FLOAT, defaultValue: 0 },
    penalty_paid: { type: DataTypes.FLOAT, defaultValue: 0 },
    total_paid: { type: DataTypes.FLOAT, allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    performed_by: { type: DataTypes.INTEGER },
    note: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "LoanRepayment", tableName: "loan_repayments" }
);

module.exports = LoanRepayment;
