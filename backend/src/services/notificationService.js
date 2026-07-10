const { Notification } = require("../models");
const { Op } = require("sequelize");

async function notifyUser(userId, { type, title, message, referenceCode }) {
  return Notification.create({
    user_id: userId,
    type,
    title,
    message,
    reference_code: referenceCode,
  });
}

async function notifyRole(role, { type, title, message, referenceCode }) {
  return Notification.create({
    target_role: role,
    type,
    title,
    message,
    reference_code: referenceCode,
  });
}

async function listForUser(user, { page, size, offset }) {
  const where = {
    [Op.or]: [{ user_id: user.id }, { target_role: user.role }],
  };
  return Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: size,
    offset,
  });
}

async function unreadCount(user) {
  return Notification.count({
    where: {
      [Op.or]: [{ user_id: user.id }, { target_role: user.role }],
      is_read: false,
    },
  });
}

async function markRead(id, user) {
  const notif = await Notification.findByPk(id);
  if (!notif) return null;
  notif.is_read = true;
  await notif.save();
  return notif;
}

async function markAllRead(user) {
  await Notification.update(
    { is_read: true },
    { where: { [Op.or]: [{ user_id: user.id }, { target_role: user.role }] } }
  );
}

module.exports = { notifyUser, notifyRole, listForUser, unreadCount, markRead, markAllRead };
