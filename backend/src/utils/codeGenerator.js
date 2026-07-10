const dayjs = require("dayjs");

function randomDigits(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function genCustomerCode() {
  return `KH${dayjs().format("YYMM")}${randomDigits(5)}`;
}

function genSavingCode() {
  return `TK${dayjs().format("YYMMDD")}${randomDigits(5)}`;
}

function genLoanCode() {
  return `KV${dayjs().format("YYMMDD")}${randomDigits(5)}`;
}

function genReceiptNo() {
  return `BL${dayjs().format("YYMMDDHHmmss")}${randomDigits(3)}`;
}

function genUsername(fullName) {
  const normalized = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .split(/\s+/);
  const last = normalized[normalized.length - 1].toLowerCase();
  const initials = normalized
    .slice(0, -1)
    .map((p) => p[0])
    .join("")
    .toLowerCase();
  return `${last}${initials}${randomDigits(2)}`;
}

module.exports = { genCustomerCode, genSavingCode, genLoanCode, genReceiptNo, genUsername };
