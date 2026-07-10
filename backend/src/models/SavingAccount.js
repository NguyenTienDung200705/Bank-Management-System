const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { SAVING_STATUS, SAVING_TYPE } = require("../config/constants");

class SavingAccount extends Model {}

SavingAccount.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    saving_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    saving_type: { type: DataTypes.ENUM(...Object.values(SAVING_TYPE)), allowNull: false },
    principal: { type: DataTypes.FLOAT, allowNull: false }, // gốc ban đầu
    balance: { type: DataTypes.FLOAT, allowNull: false }, // số dư hiện tại
    interest_rate: { type: DataTypes.FLOAT, allowNull: false }, // %/năm tại thời điểm mở
    term_months: { type: DataTypes.INTEGER, defaultValue: 0 },
    open_date: { type: DataTypes.DATEONLY, allowNull: false },
    maturity_date: { type: DataTypes.DATEONLY },
    status: {
      type: DataTypes.ENUM(...Object.values(SAVING_STATUS)),
      defaultValue: SAVING_STATUS.ACTIVE,
    },
    auto_renew: { type: DataTypes.BOOLEAN, defaultValue: false },
    closed_date: { type: DataTypes.DATEONLY },
    accumulated_interest_paid: { type: DataTypes.FLOAT, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: "SavingAccount", tableName: "saving_accounts" }
);

module.exports = SavingAccount;
