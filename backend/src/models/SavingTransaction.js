const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class SavingTransaction extends Model {}

SavingTransaction.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    saving_account_id: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("DEPOSIT", "WITHDRAW", "INTEREST_CREDIT", "CLOSE", "RENEW"),
      allowNull: false,
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    balance_after: { type: DataTypes.FLOAT, allowNull: false },
    note: { type: DataTypes.STRING },
    performed_by: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: "SavingTransaction", tableName: "saving_transactions" }
);

module.exports = SavingTransaction;
