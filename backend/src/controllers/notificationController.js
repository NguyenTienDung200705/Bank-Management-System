const notificationService = require("../services/notificationService");
const { ok } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await notificationService.listForUser(req.user, pg);
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await notificationService.unreadCount(req.user);
    return ok(res, { count });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    await notificationService.markRead(req.params.id, req.user);
    return ok(res, null, "Đã đánh dấu đã đọc.");
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user);
    return ok(res, null, "Đã đánh dấu tất cả đã đọc.");
  } catch (err) {
    next(err);
  }
}

module.exports = { list, unreadCount, markRead, markAllRead };
