const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

// Lưu lịch sử lãi suất cho từng loại (SAVING/LOAN) + kỳ hạn hoặc loại vay
class InterestRate extends Model {}

InterestRate.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category: { type: DataTypes.ENUM("SAVING", "LOAN"), allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false }, // vd: TERM_12M hoặc PERSONAL
    label: { type: DataTypes.STRING, allowNull: false },
    rate_percent_per_year: { type: DataTypes.FLOAT, allowNull: false },
    effective_from: { type: DataTypes.DATEONLY, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    updated_by: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: "InterestRate", tableName: "interest_rates" }
);

module.exports = InterestRate;
