const { Op } = require("sequelize");
const { Customer, SavingAccount, Loan, Transaction } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { genCustomerCode } = require("../utils/codeGenerator");
const { AUDIT_ACTION, SAVING_STATUS, LOAN_STATUS } = require("../config/constants");
const auditService = require("./auditService");

async function list({ page, size, offset }, filters = {}) {
  const where = {};
  if (filters.keyword) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${filters.keyword}%` } },
      { customer_code: { [Op.like]: `%${filters.keyword}%` } },
      { citizen_id: { [Op.like]: `%${filters.keyword}%` } },
      { phone: { [Op.like]: `%${filters.keyword}%` } },
    ];
  }

  const order = filters.sortBy
    ? [[filters.sortBy, filters.sortDir === "DESC" ? "DESC" : "ASC"]]
    : [["created_at", "DESC"]];

  return Customer.findAndCountAll({ where, order, limit: size, offset });
}

async function getById(id) {
  const customer = await Customer.findByPk(id, {
    include: [
      { model: SavingAccount, as: "savingAccounts" },
      { model: Loan, as: "loans" },
    ],
  });
  if (!customer) throw new AppError(404, "Không tìm thấy khách hàng.", "ResourceNotFoundException");
  return customer;
}

async function getTransactionHistory(id, { page, size, offset }) {
  await getById(id);
  return Transaction.findAndCountAll({
    where: { customer_id: id },
    order: [["transaction_date", "DESC"]],
    limit: size,
    offset,
  });
}

function validatePhone(phone) {
  return /^(0|\+84)[0-9]{9,10}$/.test(phone);
}
function validateEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function create(payload, actor) {
  if (!validatePhone(payload.phone)) {
    throw new AppError(400, "Số điện thoại không đúng định dạng.", "ValidationException");
  }
  if (!validateEmail(payload.email)) {
    throw new AppError(400, "Email không đúng định dạng.", "ValidationException");
  }
  const existing = await Customer.findOne({ where: { citizen_id: payload.citizen_id } });
  if (existing) {
    throw new AppError(400, "Số CCCD/CMND đã tồn tại trong hệ thống.", "DuplicateDataException");
  }

  const customer = await Customer.create({
    customer_code: genCustomerCode(),
    full_name: payload.full_name,
    citizen_id: payload.citizen_id,
    date_of_birth: payload.date_of_birth,
    gender: payload.gender,
    address: payload.address,
    phone: payload.phone,
    email: payload.email,
    occupation: payload.occupation,
    created_by: actor.id,
  });

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.CUSTOMER_CREATE,
    description: `Tạo khách hàng "${customer.full_name}" (${customer.customer_code}).`,
    entityType: "Customer",
    entityId: customer.id,
  });

  return customer;
}

async function update(id, payload, actor) {
  const customer = await Customer.findByPk(id);
  if (!customer) throw new AppError(404, "Không tìm thấy khách hàng.", "ResourceNotFoundException");

  if (payload.phone !== undefined) {
    if (!validatePhone(payload.phone)) {
      throw new AppError(400, "Số điện thoại không đúng định dạng.", "ValidationException");
    }
    customer.phone = payload.phone;
  }
  if (payload.email !== undefined) {
    if (!validateEmail(payload.email)) {
      throw new AppError(400, "Email không đúng định dạng.", "ValidationException");
    }
    customer.email = payload.email;
  }
  if (payload.address !== undefined) customer.address = payload.address;
  if (payload.occupation !== undefined) customer.occupation = payload.occupation;

  await customer.save();

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.CUSTOMER_UPDATE,
    description: `Cập nhật khách hàng "${customer.full_name}" (${customer.customer_code}).`,
    entityType: "Customer",
    entityId: customer.id,
  });

  return customer;
}

async function remove(id, actor) {
  const customer = await Customer.findByPk(id);
  if (!customer) throw new AppError(404, "Không tìm thấy khách hàng.", "ResourceNotFoundException");

  const activeSaving = await SavingAccount.count({
    where: { customer_id: id, status: SAVING_STATUS.ACTIVE },
  });
  if (activeSaving > 0) {
    throw new AppError(400, "Không thể xóa: khách hàng còn tài khoản tiết kiệm đang hoạt động.", "BusinessException");
  }
  const activeLoan = await Loan.count({
    where: { customer_id: id, status: [LOAN_STATUS.DISBURSED, LOAN_STATUS.OVERDUE, LOAN_STATUS.APPROVED, LOAN_STATUS.PENDING] },
  });
  if (activeLoan > 0) {
    throw new AppError(400, "Không thể xóa: khách hàng còn khoản vay chưa tất toán.", "BusinessException");
  }

  await customer.destroy();

  await auditService.log({
    user: actor,
    action: AUDIT_ACTION.CUSTOMER_DELETE,
    description: `Xóa khách hàng "${customer.full_name}" (${customer.customer_code}).`,
    entityType: "Customer",
    entityId: id,
  });

  return true;
}

module.exports = { list, getById, getTransactionHistory, create, update, remove };
