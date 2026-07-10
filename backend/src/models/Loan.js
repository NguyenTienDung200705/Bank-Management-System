const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { LOAN_STATUS, LOAN_TYPE } = require("../config/constants");

class Loan extends Model {}

Loan.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loan_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    loan_type: { type: DataTypes.ENUM(...Object.values(LOAN_TYPE)), allowNull: false },
    principal: { type: DataTypes.FLOAT, allowNull: false },
    interest_rate: { type: DataTypes.FLOAT, allowNull: false }, // %/năm
    term_months: { type: DataTypes.INTEGER, allowNull: false },
    purpose: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM(...Object.values(LOAN_STATUS)),
      defaultValue: LOAN_STATUS.PENDING,
    },
    applied_date: { type: DataTypes.DATEONLY, allowNull: false },
    approved_date: { type: DataTypes.DATEONLY },
    disbursed_date: { type: DataTypes.DATEONLY },
    settled_date: { type: DataTypes.DATEONLY },
    reviewed_by: { type: DataTypes.INTEGER },
    reject_reason: { type: DataTypes.STRING },
    outstanding_principal: { type: DataTypes.FLOAT, defaultValue: 0 },
    monthly_payment: { type: DataTypes.FLOAT, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: "Loan", tableName: "loans" }
);

module.exports = Loan;
