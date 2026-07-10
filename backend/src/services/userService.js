const { Op } = require("sequelize");
const { User } = require("../models");
const { hashPassword } = require("../utils/password");
const { AppError } = require("../middleware/errorHandler");
const { USER_STATUS, AUDIT_ACTION } = require("../config/constants");
const auditService = require("./auditService");
const { sanitizeUser } = require("./authService");

async function list({ page, size, offset }, filters = {}) {
  const where = {};
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.keyword) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${filters.keyword}%` } },
      { username: { [Op.like]: `%${filters.keyword}%` } },
      { email: { [Op.like]: `%${filters.keyword}%` } },
    ];
  }
  const result = await User.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: size,
    offset,
    attributes: { exclude: ["password_hash", "reset_code", "reset_code_expires_at"] },
  });
  return result;
}

async function getById(id) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password_hash", "reset_code", "reset_code_expires_at"] },
  });
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");
  return user;
}

async function create(payload, actor) {
  const existing = await User.findOne({
    where: { [Op.or]: [{ username: payload.username }, { email: payload.email }] },
  });
  if (existing) {
    throw new AppError(400, "Tên đăng nhập hoặc email đã tồn tại.", "DuplicateDataException");
  }
  const user = await User.create({
    username: payload.username,
    password_hash: hashPassword(payload.password || "Bank@12345"),
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    role: payload.role,
    status: USER_STATUS.ACTIVE,
    must_change_password: true,
  });

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.USER_CREATE,
    description: `Tạo người dùng mới "${user.username}" (${user.role}).`,
    entityType: "User",
    entityId: user.id,
  });

  return sanitizeUser(user);
}

async function update(id, payload, actor) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");

  ["full_name", "email", "phone", "address", "role"].forEach((field) => {
    if (payload[field] !== undefined) user[field] = payload[field];
  });
  await user.save();

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.USER_UPDATE,
    description: `Cập nhật thông tin người dùng "${user.username}".`,
    entityType: "User",
    entityId: user.id,
  });

  return sanitizeUser(user);
}

async function remove(id, actor) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");
  if (user.id === actor.id) {
    throw new AppError(400, "Không thể tự xóa tài khoản của chính mình.", "ValidationException");
  }
  await user.destroy();

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.USER_DELETE,
    description: `Xóa người dùng "${user.username}".`,
    entityType: "User",
    entityId: id,
  });
  return true;
}

async function setLock(id, locked, actor) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");

  user.status = locked ? USER_STATUS.LOCKED : USER_STATUS.ACTIVE;
  if (!locked) user.failed_login_attempts = 0;
  await user.save();

  await auditService.log({
    user: actor,
    action: locked ? AUDIT_ACTION.USER_LOCK : AUDIT_ACTION.USER_UNLOCK,
    description: `${locked ? "Khóa" : "Mở khóa"} tài khoản "${user.username}".`,
    entityType: "User",
    entityId: user.id,
  });

  return sanitizeUser(user);
}

async function resetPasswordByAdmin(id, actor) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");

  const tempPassword = "Bank@" + Math.floor(1000 + Math.random() * 9000);
  user.password_hash = hashPassword(tempPassword);
  user.must_change_password = true;
  user.failed_login_attempts = 0;
  if (user.status === USER_STATUS.LOCKED) user.status = USER_STATUS.ACTIVE;
  await user.save();

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.PASSWORD_RESET,
    description: `Admin đặt lại mật khẩu cho "${user.username}".`,
    entityType: "User",
    entityId: user.id,
  });

  return { username: user.username, tempPassword };
}

module.exports = { list, getById, create, update, remove, setLock, resetPasswordByAdmin };
