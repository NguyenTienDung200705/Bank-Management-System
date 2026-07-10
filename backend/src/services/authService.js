const dayjs = require("dayjs");
const { User } = require("../models");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { AppError } = require("../middleware/errorHandler");
const { USER_STATUS, AUDIT_ACTION } = require("../config/constants");
const auditService = require("./auditService");
const notificationService = require("./notificationService");
const configService = require("./configService");

async function login({ username, password }, meta = {}) {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    await auditService.log({
      action: AUDIT_ACTION.LOGIN_FAILED,
      description: `Đăng nhập thất bại - tài khoản "${username}" không tồn tại.`,
      level: "WARN",
      ip: meta.ip,
    });
    throw new AppError(401, "Tên đăng nhập hoặc mật khẩu không đúng.", "UnauthorizedException");
  }

  if (user.status === USER_STATUS.LOCKED) {
    throw new AppError(403, "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.", "UnauthorizedException");
  }

  const validPassword = comparePassword(password, user.password_hash);
  const maxAttempts = await configService.getNumber("MAX_LOGIN_ATTEMPTS", 5);

  if (!validPassword) {
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= maxAttempts) {
      user.status = USER_STATUS.LOCKED;
      await notificationService.notifyRole("ADMIN", {
        type: "ACCOUNT_LOCKED",
        title: "Tài khoản bị khóa tự động",
        message: `Tài khoản "${user.username}" đã bị khóa do đăng nhập sai ${maxAttempts} lần liên tiếp.`,
      });
    }
    await user.save();

    await auditService.log({
      user,
      action: AUDIT_ACTION.LOGIN_FAILED,
      description: `Sai mật khẩu (lần ${user.failed_login_attempts}/${maxAttempts}).`,
      level: "WARN",
      ip: meta.ip,
    });

    if (user.status === USER_STATUS.LOCKED) {
      throw new AppError(403, "Tài khoản đã bị khóa do nhập sai mật khẩu quá số lần cho phép.", "UnauthorizedException");
    }
    throw new AppError(401, "Tên đăng nhập hoặc mật khẩu không đúng.", "UnauthorizedException");
  }

  user.failed_login_attempts = 0;
  user.last_login_at = new Date();
  await user.save();

  await auditService.log({
    user,
    action: AUDIT_ACTION.LOGIN,
    description: `Đăng nhập thành công.`,
    ip: meta.ip,
  });

  const token = signToken({ id: user.id, role: user.role, username: user.username });

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function logout(user, meta = {}) {
  await auditService.log({
    user,
    action: AUDIT_ACTION.LOGOUT,
    description: "Đăng xuất.",
    ip: meta.ip,
  });
  return true;
}

async function changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");

  if (!comparePassword(currentPassword, user.password_hash)) {
    throw new AppError(400, "Mật khẩu hiện tại không đúng.", "ValidationException");
  }
  if (newPassword.length < 8) {
    throw new AppError(400, "Mật khẩu mới phải có ít nhất 8 ký tự.", "ValidationException");
  }
  if (newPassword !== confirmPassword) {
    throw new AppError(400, "Xác nhận mật khẩu không khớp.", "ValidationException");
  }

  user.password_hash = hashPassword(newPassword);
  user.must_change_password = false;
  await user.save();

  await auditService.log({
    user,
    action: AUDIT_ACTION.PASSWORD_CHANGE,
    description: "Đổi mật khẩu thành công.",
  });

  return true;
}

async function forgotPassword({ email }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Không tiết lộ email tồn tại hay không (bảo mật)
    return { message: "Nếu email tồn tại, mã xác nhận đã được gửi." };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.reset_code = code;
  user.reset_code_expires_at = dayjs().add(15, "minute").toDate();
  await user.save();

  // Trong môi trường demo: trả mã trực tiếp (thay vì gửi email thật) để có thể kiểm thử.
  return { message: "Mã xác nhận đã được tạo.", devResetCode: code };
}

async function resetPassword({ email, verificationCode, newPassword }) {
  const user = await User.findOne({ where: { email } });
  if (!user || user.reset_code !== verificationCode) {
    throw new AppError(400, "Mã xác nhận không hợp lệ.", "ValidationException");
  }
  if (dayjs().isAfter(dayjs(user.reset_code_expires_at))) {
    throw new AppError(400, "Mã xác nhận đã hết hạn.", "ValidationException");
  }
  if (newPassword.length < 8) {
    throw new AppError(400, "Mật khẩu mới phải có ít nhất 8 ký tự.", "ValidationException");
  }

  user.password_hash = hashPassword(newPassword);
  user.reset_code = null;
  user.reset_code_expires_at = null;
  user.status = USER_STATUS.ACTIVE;
  user.failed_login_attempts = 0;
  await user.save();

  await auditService.log({
    user,
    action: AUDIT_ACTION.PASSWORD_RESET,
    description: "Đặt lại mật khẩu qua email xác nhận.",
  });

  return true;
}

async function updateProfile(userId, { phone, email, address, avatar }) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng.", "ResourceNotFoundException");

  if (phone !== undefined) user.phone = phone;
  if (email !== undefined) user.email = email;
  if (address !== undefined) user.address = address;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const plain = user.toJSON ? user.toJSON() : user;
  delete plain.password_hash;
  delete plain.reset_code;
  delete plain.reset_code_expires_at;
  return plain;
}

module.exports = {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
  sanitizeUser,
};
