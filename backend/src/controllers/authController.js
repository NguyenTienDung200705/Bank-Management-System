const authService = require("../services/authService");
const { ok } = require("../utils/response");
const { AppError } = require("../middleware/errorHandler");

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new AppError(400, "Vui lòng nhập tên đăng nhập và mật khẩu.", "ValidationException");
    }
    const result = await authService.login({ username, password }, { ip: req.ip });
    return ok(res, result, "Đăng nhập thành công.");
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user, { ip: req.ip });
    return ok(res, null, "Đăng xuất thành công.");
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const userService = require("../services/userService");
    const user = await userService.getById(req.user.id);
    return ok(res, user);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    await authService.changePassword(req.user.id, req.body);
    return ok(res, null, "Đổi mật khẩu thành công.");
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    return ok(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    return ok(res, null, "Đặt lại mật khẩu thành công.");
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return ok(res, user, "Cập nhật hồ sơ thành công.");
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me, changePassword, forgotPassword, resetPassword, updateProfile };
