const path = require("path");
const { Sequelize } = require("sequelize");

const storagePath = path.join(__dirname, "..", "..", "data", "bslms.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

module.exports = sequelize;
