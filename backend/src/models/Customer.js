const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { GENDER } = require("../config/constants");

class Customer extends Model {}

Customer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    citizen_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    date_of_birth: { type: DataTypes.DATEONLY },
    gender: { type: DataTypes.ENUM(...Object.values(GENDER)), defaultValue: GENDER.OTHER },
    address: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    occupation: { type: DataTypes.STRING },
    created_by: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: "Customer", tableName: "customers" }
);

module.exports = Customer;
