const userService = require("../services/userService");
const { ok, created } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await userService.list(pg, {
      role: req.query.role,
      status: req.query.status,
      keyword: req.query.keyword,
    });
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    return ok(res, user);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.create(req.body, req.user);
    return created(res, user, "Tạo người dùng thành công.");
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.update(req.params.id, req.body, req.user);
    return ok(res, user, "Cập nhật người dùng thành công.");
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.remove(req.params.id, req.user);
    return ok(res, null, "Xóa người dùng thành công.");
  } catch (err) {
    next(err);
  }
}

async function lock(req, res, next) {
  try {
    const user = await userService.setLock(req.params.id, true, req.user);
    return ok(res, user, "Đã khóa tài khoản.");
  } catch (err) {
    next(err);
  }
}

async function unlock(req, res, next) {
  try {
    const user = await userService.setLock(req.params.id, false, req.user);
    return ok(res, user, "Đã mở khóa tài khoản.");
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await userService.resetPasswordByAdmin(req.params.id, req.user);
    return ok(res, result, "Đã đặt lại mật khẩu tạm thời.");
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, lock, unlock, resetPassword };
