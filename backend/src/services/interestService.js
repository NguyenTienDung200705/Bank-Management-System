const { InterestRate } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { AUDIT_ACTION } = require("../config/constants");
const auditService = require("./auditService");

async function list(category) {
  const where = category ? { category } : {};
  return InterestRate.findAll({ where, order: [["category", "ASC"], ["code", "ASC"]] });
}

async function getActiveRate(category, code) {
  const rate = await InterestRate.findOne({
    where: { category, code, is_active: true },
    order: [["effective_from", "DESC"]],
  });
  if (!rate) throw new AppError(400, `Chưa cấu hình lãi suất cho ${category} - ${code}.`, "BusinessException");
  return rate;
}

async function create(payload, actor) {
  const rate = await InterestRate.create({
    category: payload.category,
    code: payload.code,
    label: payload.label,
    rate_percent_per_year: payload.rate_percent_per_year,
    effective_from: payload.effective_from,
    is_active: true,
    updated_by: actor.id,
  });

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.INTEREST_RATE_UPDATE,
    description: `Thêm lãi suất mới ${payload.category}/${payload.code} = ${payload.rate_percent_per_year}%/năm.`,
    entityType: "InterestRate",
    entityId: rate.id,
  });

  return rate;
}

async function update(id, payload, actor) {
  const rate = await InterestRate.findByPk(id);
  if (!rate) throw new AppError(404, "Không tìm thấy cấu hình lãi suất.", "ResourceNotFoundException");

  if (payload.rate_percent_per_year !== undefined) rate.rate_percent_per_year = payload.rate_percent_per_year;
  if (payload.label !== undefined) rate.label = payload.label;
  if (payload.is_active !== undefined) rate.is_active = payload.is_active;
  if (payload.effective_from !== undefined) rate.effective_from = payload.effective_from;
  rate.updated_by = actor.id;
  await rate.save();

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.INTEREST_RATE_UPDATE,
    description: `Cập nhật lãi suất ${rate.category}/${rate.code} = ${rate.rate_percent_per_year}%/năm.`,
    entityType: "InterestRate",
    entityId: rate.id,
  });

  return rate;
}

module.exports = { list, getActiveRate, create, update };
