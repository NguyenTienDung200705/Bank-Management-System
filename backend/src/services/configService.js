const { SystemConfig } = require("../models");
const { AppError } = require("../middleware/errorHandler");

const DEFAULTS = [
  { config_key: "BANK_NAME", config_value: "VietTrust Bank", label: "Tên ngân hàng", data_type: "STRING" },
  { config_key: "BANK_SLOGAN", config_value: "Tin cậy - Bền vững - Phát triển", label: "Khẩu hiệu", data_type: "STRING" },
  { config_key: "MAX_LOGIN_ATTEMPTS", config_value: "5", label: "Số lần đăng nhập sai tối đa", data_type: "NUMBER" },
  { config_key: "MIN_PASSWORD_LENGTH", config_value: "8", label: "Độ dài mật khẩu tối thiểu", data_type: "NUMBER" },
  { config_key: "LOAN_PENALTY_RATE_PER_DAY", config_value: "0.05", label: "Lãi phạt trễ hạn vay (%/ngày)", data_type: "NUMBER" },
  { config_key: "SAVING_EARLY_WITHDRAW_RATE_RATIO", config_value: "0.2", label: "Tỉ lệ lãi suất không kỳ hạn khi rút trước hạn", data_type: "NUMBER" },
  { config_key: "CURRENCY", config_value: "VND", label: "Đơn vị tiền tệ", data_type: "STRING" },
  { config_key: "MAINTENANCE_MODE", config_value: "false", label: "Chế độ bảo trì", data_type: "BOOLEAN" },
];

async function ensureDefaults() {
  for (const cfg of DEFAULTS) {
    await SystemConfig.findOrCreate({ where: { config_key: cfg.config_key }, defaults: cfg });
  }
}

async function getAll() {
  return SystemConfig.findAll({ order: [["config_key", "ASC"]] });
}

async function getValue(key, fallback = null) {
  const cfg = await SystemConfig.findOne({ where: { config_key: key } });
  return cfg ? cfg.config_value : fallback;
}

async function getNumber(key, fallback = 0) {
  const value = await getValue(key, null);
  return value === null ? fallback : Number(value);
}

async function update(key, value, user) {
  const cfg = await SystemConfig.findOne({ where: { config_key: key } });
  if (!cfg) throw new AppError(404, "Không tìm thấy cấu hình.", "ResourceNotFoundException");
  cfg.config_value = String(value);
  cfg.updated_by = user.id;
  await cfg.save();
  return cfg;
}

module.exports = { ensureDefaults, getAll, getValue, getNumber, update };
