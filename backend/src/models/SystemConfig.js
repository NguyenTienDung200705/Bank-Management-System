const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class SystemConfig extends Model {}

SystemConfig.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    config_key: { type: DataTypes.STRING, allowNull: false, unique: true },
    config_value: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    data_type: { type: DataTypes.ENUM("STRING", "NUMBER", "BOOLEAN"), defaultValue: "STRING" },
    updated_by: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: "SystemConfig", tableName: "system_configs" }
);

module.exports = SystemConfig;
