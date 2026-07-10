const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { AUDIT_ACTION } = require("../config/constants");

class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    username: { type: DataTypes.STRING },
    action: { type: DataTypes.ENUM(...Object.values(AUDIT_ACTION)), allowNull: false },
    level: { type: DataTypes.ENUM("INFO", "WARN", "ERROR"), defaultValue: "INFO" },
    description: { type: DataTypes.STRING },
    ip_address: { type: DataTypes.STRING },
    entity_type: { type: DataTypes.STRING },
    entity_id: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "AuditLog", tableName: "audit_logs" }
);

module.exports = AuditLog;
