import dayjs from "dayjs";

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN").format(Math.round(Number(value))) + " ₫";
}

export function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("vi-VN").format(Number(value));
}

export function formatDate(value) {
  if (!value) return "—";
  return dayjs(value).format("DD/MM/YYYY");
}

export function formatDateTime(value) {
  if (!value) return "—";
  return dayjs(value).format("DD/MM/YYYY HH:mm");
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}
