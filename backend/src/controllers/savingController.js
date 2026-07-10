const savingService = require("../services/savingService");
const { ok, created } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await savingService.list(pg, {
      status: req.query.status,
      customerId: req.query.customerId,
      keyword: req.query.keyword,
    });
    return ok(res, buildPageResult(result, pg.page, pg.size));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const account = await savingService.getById(req.params.id);
    return ok(res, account);
  } catch (err) {
    next(err);
  }
}

async function open(req, res, next) {
  try {
    const account = await savingService.open(req.body, req.user);
    return created(res, account, "Mở sổ tiết kiệm thành công.");
  } catch (err) {
    next(err);
  }
}

async function deposit(req, res, next) {
  try {
    const account = await savingService.deposit(req.params.id, req.body, req.user);
    return ok(res, account, "Gửi tiền thành công.");
  } catch (err) {
    next(err);
  }
}

async function withdraw(req, res, next) {
  try {
    const account = await savingService.withdraw(req.params.id, req.body, req.user);
    return ok(res, account, "Rút tiền thành công.");
  } catch (err) {
    next(err);
  }
}

async function close(req, res, next) {
  try {
    const result = await savingService.close(req.params.id, req.body, req.user);
    return ok(res, result, "Tất toán sổ tiết kiệm thành công.");
  } catch (err) {
    next(err);
  }
}

async function renew(req, res, next) {
  try {
    const account = await savingService.renew(req.params.id, req.user);
    return ok(res, account, "Tái tục sổ tiết kiệm thành công.");
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, open, deposit, withdraw, close, renew };
