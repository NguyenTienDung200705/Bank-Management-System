const reportService = require("../services/reportService");
const { ok } = require("../utils/response");

async function summary(req, res, next) {
  try {
    const data = await reportService.dashboardSummary();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function revenue(req, res, next) {
  try {
    const data = await reportService.revenueByMonth(Number(req.query.months) || 12);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function savings(req, res, next) {
  try {
    const data = await reportService.savingStatistics();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function loans(req, res, next) {
  try {
    const data = await reportService.loanStatistics();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function customers(req, res, next) {
  try {
    const data = await reportService.customerStatistics();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function periodic(req, res, next) {
  try {
    const { from, to } = req.query;
    const data = await reportService.periodicReport({ from, to });
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, revenue, savings, loans, customers, periodic };
