const customerService = require("../services/customerService");
const { ok, created } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await customerService.list(pg, {
      keyword: req.query.keyword,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir,
    });
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const customer = await customerService.getById(req.params.id);
    return ok(res, customer);
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await customerService.getTransactionHistory(req.params.id, pg);
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const customer = await customerService.create(req.body, req.user);
    return created(res, customer, "Tạo khách hàng thành công.");
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const customer = await customerService.update(req.params.id, req.body, req.user);
    return ok(res, customer, "Cập nhật khách hàng thành công.");
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await customerService.remove(req.params.id, req.user);
    return ok(res, null, "Xóa khách hàng thành công.");
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, getTransactions, create, update, remove };
