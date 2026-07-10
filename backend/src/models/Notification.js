const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { NOTIFICATION_TYPE } = require("../config/constants");

class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER }, // null = broadcast cho tất cả role liên quan
    target_role: { type: DataTypes.STRING }, // nếu broadcast theo role
    type: { type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPE)), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    reference_code: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "Notification", tableName: "notifications" }
);

module.exports = Notification;
