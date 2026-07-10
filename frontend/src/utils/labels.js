export const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  TELLER: "Giao dịch viên",
  LOAN_OFFICER: "Chuyên viên tín dụng",
  MANAGER: "Quản lý",
};

export const SAVING_TYPE_LABELS = {
  NO_TERM: "Không kỳ hạn",
  TERM_1M: "Kỳ hạn 1 tháng",
  TERM_3M: "Kỳ hạn 3 tháng",
  TERM_6M: "Kỳ hạn 6 tháng",
  TERM_12M: "Kỳ hạn 12 tháng",
  TERM_24M: "Kỳ hạn 24 tháng",
};

export const LOAN_TYPE_LABELS = {
  PERSONAL: "Vay tiêu dùng",
  BUSINESS: "Vay kinh doanh",
  MORTGAGE: "Vay thế chấp",
  AUTO: "Vay mua ô tô",
  EDUCATION: "Vay du học",
};

export const SAVING_STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", color: "success" },
  CLOSED: { label: "Đã tất toán", color: "default" },
  MATURED: { label: "Đã đáo hạn", color: "info" },
};

export const LOAN_STATUS_META = {
  PENDING: { label: "Chờ duyệt", color: "warning" },
  APPROVED: { label: "Đã duyệt", color: "info" },
  REJECTED: { label: "Từ chối", color: "error" },
  DISBURSED: { label: "Đã giải ngân", color: "success" },
  OVERDUE: { label: "Quá hạn", color: "error" },
  SETTLED: { label: "Đã tất toán", color: "default" },
};

export const TRANSACTION_TYPE_META = {
  DEPOSIT: { label: "Gửi tiền", color: "success" },
  WITHDRAW: { label: "Rút tiền", color: "warning" },
  SAVING_CLOSE: { label: "Tất toán sổ TK", color: "default" },
  LOAN_DISBURSEMENT: { label: "Giải ngân vay", color: "info" },
  LOAN_REPAYMENT: { label: "Thu nợ vay", color: "success" },
};

export const SCHEDULE_STATUS_META = {
  PENDING: { label: "Chưa đến hạn", color: "default" },
  PARTIAL: { label: "Trả một phần", color: "warning" },
  PAID: { label: "Đã trả", color: "success" },
  OVERDUE: { label: "Quá hạn", color: "error" },
};

export const USER_STATUS_META = {
  ACTIVE: { label: "Hoạt động", color: "success" },
  LOCKED: { label: "Đã khóa", color: "error" },
};

export const NOTIFICATION_ICON = {
  LOAN_OVERDUE: "warning",
  LOAN_APPROVED: "success",
  LOAN_REJECTED: "error",
  SAVING_MATURED: "info",
  SYSTEM: "info",
  ACCOUNT_LOCKED: "error",
};
