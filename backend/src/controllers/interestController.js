const interestService = require("../services/interestService");
const { ok, created } = require("../utils/response");

async function list(req, res, next) {
  try {
    const rates = await interestService.list(req.query.category);
    return ok(res, rates);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const rate = await interestService.create(req.body, req.user);
    return created(res, rate, "Thêm cấu hình lãi suất thành công.");
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const rate = await interestService.update(req.params.id, req.body, req.user);
    return ok(res, rate, "Cập nhật lãi suất thành công.");
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
