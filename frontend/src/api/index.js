import client from "./client";

export const authApi = {
  login: (data) => client.post("/auth/login", data),
  logout: () => client.post("/auth/logout"),
  me: () => client.get("/auth/me"),
  changePassword: (data) => client.post("/auth/change-password", data),
  forgotPassword: (data) => client.post("/auth/forgot-password", data),
  resetPassword: (data) => client.post("/auth/reset-password", data),
  updateProfile: (data) => client.put("/auth/profile", data),
};

export const userApi = {
  list: (params) => client.get("/users", { params }),
  getById: (id) => client.get(`/users/${id}`),
  create: (data) => client.post("/users", data),
  update: (id, data) => client.put(`/users/${id}`, data),
  remove: (id) => client.delete(`/users/${id}`),
  lock: (id) => client.post(`/users/${id}/lock`),
  unlock: (id) => client.post(`/users/${id}/unlock`),
  resetPassword: (id) => client.post(`/users/${id}/reset-password`),
};

export const customerApi = {
  list: (params) => client.get("/customers", { params }),
  getById: (id) => client.get(`/customers/${id}`),
  getTransactions: (id, params) => client.get(`/customers/${id}/transactions`, { params }),
  create: (data) => client.post("/customers", data),
  update: (id, data) => client.put(`/customers/${id}`, data),
  remove: (id) => client.delete(`/customers/${id}`),
};

export const savingApi = {
  list: (params) => client.get("/savings", { params }),
  getById: (id) => client.get(`/savings/${id}`),
  open: (data) => client.post("/savings", data),
  deposit: (id, data) => client.post(`/savings/${id}/deposit`, data),
  withdraw: (id, data) => client.post(`/savings/${id}/withdraw`, data),
  close: (id, data) => client.post(`/savings/${id}/close`, data),
  renew: (id) => client.post(`/savings/${id}/renew`),
};

export const loanApi = {
  list: (params) => client.get("/loans", { params }),
  getById: (id) => client.get(`/loans/${id}`),
  apply: (data) => client.post("/loans", data),
  approve: (id) => client.post(`/loans/${id}/approve`),
  reject: (id, data) => client.post(`/loans/${id}/reject`, data),
  disburse: (id) => client.post(`/loans/${id}/disburse`),
  repay: (id, data) => client.post(`/loans/${id}/repay`, data),
  settle: (id) => client.post(`/loans/${id}/settle`),
  detectOverdue: () => client.post("/loans/detect-overdue"),
  statistics: () => client.get("/loans/statistics"),
};

export const interestApi = {
  list: (params) => client.get("/interest-rates", { params }),
  create: (data) => client.post("/interest-rates", data),
  update: (id, data) => client.put(`/interest-rates/${id}`, data),
};

export const transactionApi = {
  list: (params) => client.get("/transactions", { params }),
  getReceipt: (id) => client.get(`/transactions/${id}/receipt`),
};

export const reportApi = {
  summary: () => client.get("/reports/summary"),
  revenue: (params) => client.get("/reports/revenue", { params }),
  savings: () => client.get("/reports/savings"),
  loans: () => client.get("/reports/loans"),
  customers: () => client.get("/reports/customers"),
  periodic: (params) => client.get("/reports/periodic", { params }),
};

export const notificationApi = {
  list: (params) => client.get("/notifications", { params }),
  unreadCount: () => client.get("/notifications/unread-count"),
  markRead: (id) => client.post(`/notifications/${id}/read`),
  markAllRead: () => client.post("/notifications/read-all"),
};

export const auditApi = {
  list: (params) => client.get("/audit-logs", { params }),
};

export const configApi = {
  list: () => client.get("/configs"),
  update: (key, value) => client.put(`/configs/${key}`, { value }),
};
