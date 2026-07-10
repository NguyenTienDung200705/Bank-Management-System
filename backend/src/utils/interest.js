const dayjs = require("dayjs");

const DAYS_IN_YEAR = 365;

/**
 * Lãi tiết kiệm tích lũy từ open_date đến toDate theo lãi đơn (simple interest),
 * dùng cho tiền gửi không kỳ hạn hoặc tính lãi tạm tính khi tất toán trước hạn.
 * FR-019: Daily / Monthly / Maturity interest.
 */
function calcSimpleInterest(principal, ratePercentPerYear, fromDate, toDate) {
  const days = Math.max(dayjs(toDate).diff(dayjs(fromDate), "day"), 0);
  const dailyRate = ratePercentPerYear / 100 / DAYS_IN_YEAR;
  return round2(principal * dailyRate * days);
}

function calcDailyInterest(principal, ratePercentPerYear) {
  const dailyRate = ratePercentPerYear / 100 / DAYS_IN_YEAR;
  return round2(principal * dailyRate);
}

function calcMonthlyInterest(principal, ratePercentPerYear) {
  return round2((principal * (ratePercentPerYear / 100)) / 12);
}

/**
 * Lãi đáo hạn (maturity) cho tiền gửi có kỳ hạn: lãi đơn * số tháng kỳ hạn.
 */
function calcMaturityInterest(principal, ratePercentPerYear, termMonths) {
  return round2(principal * (ratePercentPerYear / 100) * (termMonths / 12));
}

/**
 * Phạt rút trước hạn: quy về lãi suất không kỳ hạn (giả định 20% lãi suất gốc).
 * Trả về phần chênh lệch lãi bị mất so với lãi đã tính theo kỳ hạn đầy đủ.
 */
function calcEarlyWithdrawPenalty(principal, ratePercentPerYear, actualDays, termMonths) {
  const noTermRate = ratePercentPerYear * 0.2; // lãi suất không kỳ hạn giả định
  const earnedInterest = round2(principal * (noTermRate / 100 / DAYS_IN_YEAR) * actualDays);
  const fullTermInterest = calcMaturityInterest(principal, ratePercentPerYear, termMonths);
  const penalty = round2(Math.max(fullTermInterest - earnedInterest, 0));
  return { earnedInterest, penalty };
}

/**
 * Sinh lịch trả nợ vay theo phương pháp dư nợ giảm dần (declining balance),
 * trả gốc đều mỗi kỳ + lãi tính trên dư nợ còn lại.
 * FR-026: Automatically generate repayment schedule.
 */
function generateAmortizationSchedule({ principal, ratePercentPerYear, termMonths, startDate }) {
  const monthlyRate = ratePercentPerYear / 100 / 12;
  const principalPerPeriod = round2(principal / termMonths);
  let remaining = principal;
  const schedule = [];

  for (let i = 1; i <= termMonths; i++) {
    const interestDue = round2(remaining * monthlyRate);
    const isLast = i === termMonths;
    const principalDue = isLast ? round2(remaining) : principalPerPeriod;
    const totalDue = round2(principalDue + interestDue);
    const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");

    schedule.push({
      period_no: i,
      due_date: dueDate,
      principal_due: principalDue,
      interest_due: interestDue,
      penalty_due: 0,
      total_due: totalDue,
      amount_paid: 0,
      status: "PENDING",
    });

    remaining = round2(remaining - principalDue);
  }

  return schedule;
}

/**
 * Tính phạt trễ hạn: % / ngày trên số tiền quá hạn.
 */
function calcOverduePenalty(overdueAmount, penaltyRatePercentPerDay, overdueDays) {
  return round2(overdueAmount * (penaltyRatePercentPerDay / 100) * overdueDays);
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

module.exports = {
  calcSimpleInterest,
  calcDailyInterest,
  calcMonthlyInterest,
  calcMaturityInterest,
  calcEarlyWithdrawPenalty,
  generateAmortizationSchedule,
  calcOverduePenalty,
  round2,
};
