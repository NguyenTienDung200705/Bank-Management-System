const { fail } = require("../utils/response");

/**
 * RBAC middleware - kiểm tra role được phép truy cập.
 * Usage: authorize("ADMIN", "MANAGER")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, "Chưa xác thực.");
    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, 403, "Bạn không có quyền thực hiện thao tác này.");
    }
    next();
  };
}

module.exports = authorize;
