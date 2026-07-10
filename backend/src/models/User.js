const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { ROLES, USER_STATUS } = require("../config/constants");

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.TELLER,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      allowNull: false,
      defaultValue: USER_STATUS.ACTIVE,
    },
    failed_login_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_login_at: { type: DataTypes.DATE },
    reset_code: { type: DataTypes.STRING },
    reset_code_expires_at: { type: DataTypes.DATE },
    must_change_password: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: "User", tableName: "users" }
);

module.exports = User;
