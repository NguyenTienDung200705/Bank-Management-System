const bcrypt = require("bcryptjs");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

function hashPassword(plain) {
  return bcrypt.hashSync(plain, SALT_ROUNDS);
}

function comparePassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

module.exports = { hashPassword, comparePassword };
