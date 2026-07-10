const { verifyToken } = require("../utils/jwt");
const { fail } = require("../utils/response");
const { User } = require("../models");
const { USER_STATUS } = require("../config/constants");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return fail(res, 401, "Thiếu token xác thực.");
    }
    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    const user = await User.findByPk(payload.id);
    if (!user) return fail(res, 401, "Người dùng không tồn tại.");
    if (user.status === USER_STATUS.LOCKED) {
      return fail(res, 403, "Tài khoản đã bị khóa.");
    }

    req.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      email: user.email,
    };
    next();
  } catch (err) {
    return fail(res, 401, "Token không hợp lệ hoặc đã hết hạn.");
  }
}

module.exports = authenticate;
