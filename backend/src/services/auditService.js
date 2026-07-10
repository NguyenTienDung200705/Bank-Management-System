const { AuditLog } = require("../models");

async function log({ user, action, description, level = "INFO", entityType, entityId, ip }) {
  try {
    await AuditLog.create({
      user_id: user ? user.id : null,
      username: user ? user.username : "SYSTEM",
      action,
      level,
      description,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      ip_address: ip,
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}

async function list({ page, size, offset }, filters = {}) {
  const where = {};
  if (filters.action) where.action = filters.action;
  if (filters.username) {
    const { Op } = require("sequelize");
    where.username = { [Op.like]: `%${filters.username}%` };
  }
  const result = await AuditLog.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: size,
    offset,
  });
  return result;
}

module.exports = { log, list };
