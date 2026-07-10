import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("bslms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bslms_token");
      localStorage.removeItem("bslms_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    const message =
      error.response?.data?.message || error.message || "Đã xảy ra lỗi không xác định.";
    return Promise.reject({ message, status: error.response?.status, raw: error });
  }
);

export default client;
