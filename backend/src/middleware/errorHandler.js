const dayjs = require("dayjs");

class AppError extends Error {
  constructor(status, message, errorType = "BusinessException") {
    super(message);
    this.status = status;
    this.errorType = errorType;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(404, `Không tìm thấy đường dẫn: ${req.originalUrl}`, "ResourceNotFoundException"));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const errorType = err.errorType || (status === 500 ? "InternalServerError" : "BusinessException");

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    timestamp: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    status,
    error: errorType,
    message: err.message || "Đã xảy ra lỗi không xác định.",
    path: req.originalUrl,
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
