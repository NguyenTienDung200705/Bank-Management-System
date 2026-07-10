const { Op } = require("sequelize");
const { Transaction, Customer } = require("../models");
const { AppError } = require("../middleware/errorHandler");

async function list({ page, size, offset }, filters = {}) {
  const where = {};
  if (filters.type) where.type = filters.type;
  if (filters.customerId) where.customer_id = filters.customerId;
  if (filters.keyword) {
    where[Op.or] = [
      { receipt_no: { [Op.like]: `%${filters.keyword}%` } },
      { reference_code: { [Op.like]: `%${filters.keyword}%` } },
    ];
  }
  if (filters.fromDate && filters.toDate) {
    where.transaction_date = { [Op.between]: [filters.fromDate, filters.toDate] };
  }

  return Transaction.findAndCountAll({
    where,
    include: [{ model: Customer, as: "customer", attributes: ["id", "full_name", "customer_code"] }],
    order: [["transaction_date", "DESC"]],
    limit: size,
    offset,
  });
}

async function getReceipt(id) {
  const tx = await Transaction.findByPk(id, {
    include: [{ model: Customer, as: "customer" }],
  });
  if (!tx) throw new AppError(404, "Không tìm thấy giao dịch.", "ResourceNotFoundException");
  return tx;
}

module.exports = { list, getReceipt };
