const transactionService = require("../services/transactionService");
const { ok } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await transactionService.list(pg, {
      type: req.query.type,
      customerId: req.query.customerId,
      keyword: req.query.keyword,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

async function getReceipt(req, res, next) {
  try {
    const tx = await transactionService.getReceipt(req.params.id);
    return ok(res, tx);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getReceipt };
