const auditService = require("../services/auditService");
const { ok } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await auditService.list(pg, {
      action: req.query.action,
      username: req.query.username,
    });
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
