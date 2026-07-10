const configService = require("../services/configService");
const { ok } = require("../utils/response");

async function list(req, res, next) {
  try {
    const configs = await configService.getAll();
    return ok(res, configs);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const cfg = await configService.update(req.params.key, req.body.value, req.user);
    return ok(res, cfg, "Cập nhật cấu hình thành công.");
  } catch (err) {
    next(err);
  }
}

module.exports = { list, update };
