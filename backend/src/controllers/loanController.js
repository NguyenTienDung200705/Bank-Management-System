const loanService = require("../services/loanService");
const { ok, created } = require("../utils/response");
const { getPagination, buildPageResult } = require("../utils/pagination");

async function list(req, res, next) {
  try {
    const pg = getPagination(req.query);
    const result = await loanService.list(pg, {
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
    const loan = await loanService.getById(req.params.id);
    return ok(res, loan);
  } catch (err) {
    next(err);
  }
}

async function apply(req, res, next) {
  try {
    const loan = await loanService.apply(req.body, req.user);
    return created(res, loan, "Đăng ký khoản vay thành công.");
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const loan = await loanService.decide(req.params.id, { approve: true }, req.user);
    return ok(res, loan, "Đã duyệt khoản vay.");
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const loan = await loanService.decide(req.params.id, { approve: false, reason: req.body.reason }, req.user);
    return ok(res, loan, "Đã từ chối khoản vay.");
  } catch (err) {
    next(err);
  }
}

async function disburse(req, res, next) {
  try {
    const loan = await loanService.disburse(req.params.id, req.user);
    return ok(res, loan, "Giải ngân thành công.");
  } catch (err) {
    next(err);
  }
}

async function repay(req, res, next) {
  try {
    const result = await loanService.repay(req.params.id, req.body, req.user);
    return ok(res, result, "Thu nợ thành công.");
  } catch (err) {
    next(err);
  }
}

async function settle(req, res, next) {
  try {
    const result = await loanService.settle(req.params.id, req.user);
    return ok(res, result, "Tất toán khoản vay thành công.");
  } catch (err) {
    next(err);
  }
}

async function detectOverdue(req, res, next) {
  try {
    const result = await loanService.detectOverdue();
    return ok(res, result, "Đã quét các khoản vay quá hạn.");
  } catch (err) {
    next(err);
  }
}

async function statistics(req, res, next) {
  try {
    const result = await loanService.statistics();
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, apply, approve, reject, disburse, repay, settle, detectOverdue, statistics };
