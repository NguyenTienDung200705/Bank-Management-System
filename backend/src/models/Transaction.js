const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { TRANSACTION_TYPE } = require("../config/constants");

// Bảng giao dịch tổng hợp dùng cho in biên lai & báo cáo
class Transaction extends Model {}

Transaction.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    receipt_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPE)), allowNull: false },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    reference_code: { type: DataTypes.STRING }, // saving_code hoặc loan_code
    amount: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.STRING },
    performed_by: { type: DataTypes.INTEGER },
    transaction_date: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "Transaction", tableName: "transactions" }
);

module.exports = Transaction;
