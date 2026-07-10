require("dotenv").config();
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const {
  User,
  Customer,
  InterestRate,
  SavingAccount,
  SavingTransaction,
  Loan,
  LoanRepaymentSchedule,
  LoanRepayment,
  Transaction,
  Notification,
  AuditLog,
  SystemConfig,
} = require("../models");
const { hashPassword } = require("../utils/password");
const { genSavingCode, genLoanCode, genReceiptNo, genCustomerCode } = require("../utils/codeGenerator");
const { generateAmortizationSchedule, calcMaturityInterest, round2 } = require("../utils/interest");
const configService = require("../services/configService");

async function seed() {
  const dataDir = path.join(__dirname, "..", "..", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  console.log("🔄 Đang khởi tạo lại cơ sở dữ liệu...");
  await sequelize.sync({ force: true });
  await configService.ensureDefaults();

  console.log("👤 Tạo người dùng mẫu...");
  const users = await User.bulkCreate([
    {
      username: "admin",
      password_hash: hashPassword("Admin@123"),
      full_name: "Tạ Diệu Hương",
      email: "dieuhuong2411@gmail.com",
      phone: "0886328956",
      address: "Hà Nội",
      role: "ADMIN",
      status: "ACTIVE",
    },
    {
      username: "teller1",
      password_hash: hashPassword("Teller@123"),
      full_name: "Nguyễn Thị Thu",
      email: "thithu@gmail.com",
      phone: "0674927492",
      address: "Hải Phòng",
      role: "TELLER",
      status: "ACTIVE",
    },
    {
      username: "loanofficer1",
      password_hash: hashPassword("Loan@123"),
      full_name: "Lê Văn Hùng",
      email: "Vanhung@gmail.com",
      phone: "0947629523",
      address: "Hà Giang",
      role: "HUNG_OFFICER",
      status: "ACTIVE",
    },
    {
      username: "manager1",
      password_hash: hashPassword("Manager@123"),
      full_name: "Phạm Thị Lan",
      email: "phamlan@gmail.com",
      phone: "0729543018",
      address: "Cà Mau",
      role: "MANAGER",
      status: "ACTIVE",
    },
  ]);
  const [admin, teller, loanOfficer] = users;

  console.log("📈 Tạo cấu hình lãi suất...");
  const today = dayjs().subtract(6, "month").format("YYYY-MM-DD");
  const savingRates = [
    { code: "NO_TERM", label: "Không kỳ hạn", rate: 0.5 },
    { code: "TERM_1M", label: "Kỳ hạn 1 tháng", rate: 3.0 },
    { code: "TERM_3M", label: "Kỳ hạn 3 tháng", rate: 3.8 },
    { code: "TERM_6M", label: "Kỳ hạn 6 tháng", rate: 4.7 },
    { code: "TERM_12M", label: "Kỳ hạn 12 tháng", rate: 5.6 },
    { code: "TERM_24M", label: "Kỳ hạn 24 tháng", rate: 6.1 },
  ];
  const loanRates = [
    { code: "PERSONAL", label: "Vay tiêu dùng cá nhân", rate: 10.5 },
    { code: "BUSINESS", label: "Vay kinh doanh", rate: 9.2 },
    { code: "MORTGAGE", label: "Vay thế chấp bất động sản", rate: 8.0 },
    { code: "AUTO", label: "Vay mua ô tô", rate: 9.8 },
    { code: "EDUCATION", label: "Vay du học / giáo dục", rate: 7.5 },
  ];

  for (const r of savingRates) {
    await InterestRate.create({
      category: "SAVING",
      code: r.code,
      label: r.label,
      rate_percent_per_year: r.rate,
      effective_from: today,
      is_active: true,
      updated_by: admin.id,
    });
  }
  for (const r of loanRates) {
    await InterestRate.create({
      category: "LOAN",
      code: r.code,
      label: r.label,
      rate_percent_per_year: r.rate,
      effective_from: today,
      is_active: true,
      updated_by: admin.id,
    });
  }

  console.log("🧑‍🤝‍🧑 Tạo khách hàng mẫu...");
  const customerSeeds = [
    { full_name: "Đặng Minh Anh", citizen_id: "001099012345", phone: "0912345601", gender: "FEMALE", occupation: "Kỹ sư phần mềm", dob: "1999-03-12" },
    { full_name: "Bùi Quang Huy", citizen_id: "001098012346", phone: "0912345602", gender: "MALE", occupation: "Kinh doanh tự do", dob: "1990-07-21" },
    { full_name: "Ngô Thị Lan", citizen_id: "001095012347", phone: "0912345603", gender: "FEMALE", occupation: "Giáo viên", dob: "1985-11-02" },
    { full_name: "Vũ Đình Khoa", citizen_id: "001092012348", phone: "0912345604", gender: "MALE", occupation: "Bác sĩ", dob: "1988-01-15" },
    { full_name: "Hoàng Thị Mai", citizen_id: "001097012349", phone: "0912345605", gender: "FEMALE", occupation: "Nhân viên văn phòng", dob: "1996-09-09" },
    { full_name: "Phan Văn Đức", citizen_id: "001093012350", phone: "0912345606", gender: "MALE", occupation: "Chủ doanh nghiệp", dob: "1980-05-30" },
    { full_name: "Trịnh Thu Hà", citizen_id: "001096012351", phone: "0912345607", gender: "FEMALE", occupation: "Dược sĩ", dob: "1993-12-25" },
    { full_name: "Đỗ Anh Tuấn", citizen_id: "001091012352", phone: "0912345608", gender: "MALE", occupation: "Kỹ sư xây dựng", dob: "1987-04-18" },
  ];

  const customers = [];
  for (const c of customerSeeds) {
    const customer = await Customer.create({
      customer_code: genCustomerCode(),
      full_name: c.full_name,
      citizen_id: c.citizen_id,
      date_of_birth: c.dob,
      gender: c.gender,
      address: "Hà Nội, Việt Nam",
      phone: c.phone,
      email: `${c.full_name.split(" ").pop().toLowerCase()}@gmail.com`,
      occupation: c.occupation,
      created_by: teller.id,
    });
    customers.push(customer);
  }

  console.log("💰 Tạo sổ tiết kiệm mẫu...");
  const savingTypeMap = { NO_TERM: 0, TERM_1M: 1, TERM_3M: 3, TERM_6M: 6, TERM_12M: 12, TERM_24M: 24 };
  const savingPlans = [
    { customer: customers[0], type: "TERM_12M", amount: 150_000_000, monthsAgo: 4 },
    { customer: customers[1], type: "TERM_6M", amount: 80_000_000, monthsAgo: 2 },
    { customer: customers[2], type: "NO_TERM", amount: 20_000_000, monthsAgo: 1 },
    { customer: customers[3], type: "TERM_24M", amount: 300_000_000, monthsAgo: 8 },
    { customer: customers[4], type: "TERM_3M", amount: 45_000_000, monthsAgo: 1 },
  ];

  for (const plan of savingPlans) {
    const rate = savingRates.find((r) => r.code === plan.type).rate;
    const termMonths = savingTypeMap[plan.type];
    const openDate = dayjs().subtract(plan.monthsAgo, "month").format("YYYY-MM-DD");
    const maturityDate = termMonths > 0 ? dayjs(openDate).add(termMonths, "month").format("YYYY-MM-DD") : null;

    const account = await SavingAccount.create({
      saving_code: genSavingCode(),
      customer_id: plan.customer.id,
      saving_type: plan.type,
      principal: plan.amount,
      balance: plan.amount,
      interest_rate: rate,
      term_months: termMonths,
      open_date: openDate,
      maturity_date: maturityDate,
      status: "ACTIVE",
      created_by: teller.id,
    });

    await SavingTransaction.create({
      saving_account_id: account.id,
      type: "DEPOSIT",
      amount: plan.amount,
      balance_after: plan.amount,
      note: "Mở tài khoản tiết kiệm",
      performed_by: teller.id,
    });

    await Transaction.create({
      receipt_no: genReceiptNo(),
      type: "DEPOSIT",
      customer_id: plan.customer.id,
      reference_code: account.saving_code,
      amount: plan.amount,
      description: `Mở sổ tiết kiệm ${account.saving_code}`,
      performed_by: teller.id,
      transaction_date: dayjs(openDate).toDate(),
    });
  }

  console.log("🏦 Tạo khoản vay mẫu...");
  // Khoản vay đã giải ngân, có lịch trả nợ, một vài kỳ đã trả
  const loan1Rate = loanRates.find((r) => r.code === "PERSONAL").rate;
  const loan1AppliedDate = dayjs().subtract(5, "month").format("YYYY-MM-DD");
  const loan1 = await Loan.create({
    loan_code: genLoanCode(),
    customer_id: customers[5].id,
    loan_type: "PERSONAL",
    principal: 100_000_000,
    interest_rate: loan1Rate,
    term_months: 12,
    purpose: "Sửa chữa nhà ở",
    status: "DISBURSED",
    applied_date: loan1AppliedDate,
    approved_date: dayjs(loan1AppliedDate).add(1, "day").format("YYYY-MM-DD"),
    disbursed_date: dayjs(loan1AppliedDate).add(2, "day").format("YYYY-MM-DD"),
    reviewed_by: loanOfficer.id,
    outstanding_principal: 100_000_000,
    created_by: teller.id,
  });

  const schedule1 = generateAmortizationSchedule({
    principal: loan1.principal,
    ratePercentPerYear: loan1.interest_rate,
    termMonths: loan1.term_months,
    startDate: loan1.disbursed_date,
  });

  let outstanding = loan1.principal;
  for (let i = 0; i < schedule1.length; i++) {
    const period = schedule1[i];
    const isPaid = i < 3; // 3 kỳ đầu đã trả
    if (isPaid) {
      period.amount_paid = period.total_due;
      period.status = "PAID";
      period.paid_date = period.due_date;
      outstanding = round2(outstanding - period.principal_due);
    }
    const sched = await LoanRepaymentSchedule.create({ loan_id: loan1.id, ...period });

    if (isPaid) {
      await LoanRepayment.create({
        loan_id: loan1.id,
        schedule_id: sched.id,
        principal_paid: period.principal_due,
        interest_paid: period.interest_due,
        penalty_paid: 0,
        total_paid: period.total_due,
        payment_date: period.due_date,
        performed_by: teller.id,
        note: `Thanh toán kỳ ${period.period_no}`,
      });
      await Transaction.create({
        receipt_no: genReceiptNo(),
        type: "LOAN_REPAYMENT",
        customer_id: customers[5].id,
        reference_code: loan1.loan_code,
        amount: period.total_due,
        description: `Thanh toán khoản vay ${loan1.loan_code} - kỳ ${period.period_no}`,
        performed_by: teller.id,
        transaction_date: dayjs(period.due_date).toDate(),
      });
    }
  }
  loan1.outstanding_principal = outstanding;
  loan1.monthly_payment = schedule1[0].total_due;
  await loan1.save();

  await Transaction.create({
    receipt_no: genReceiptNo(),
    type: "LOAN_DISBURSEMENT",
    customer_id: customers[5].id,
    reference_code: loan1.loan_code,
    amount: loan1.principal,
    description: `Giải ngân khoản vay ${loan1.loan_code}`,
    performed_by: teller.id,
    transaction_date: dayjs(loan1.disbursed_date).toDate(),
  });

  // Khoản vay đang chờ duyệt
  await Loan.create({
    loan_code: genLoanCode(),
    customer_id: customers[6].id,
    loan_type: "BUSINESS",
    principal: 250_000_000,
    interest_rate: loanRates.find((r) => r.code === "BUSINESS").rate,
    term_months: 24,
    purpose: "Mở rộng kinh doanh nhà thuốc",
    status: "PENDING",
    applied_date: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    created_by: teller.id,
  });

  // Khoản vay quá hạn (để test overdue)
  const loan3AppliedDate = dayjs().subtract(4, "month").format("YYYY-MM-DD");
  const loan3 = await Loan.create({
    loan_code: genLoanCode(),
    customer_id: customers[7].id,
    loan_type: "AUTO",
    principal: 400_000_000,
    interest_rate: loanRates.find((r) => r.code === "AUTO").rate,
    term_months: 36,
    purpose: "Mua ô tô",
    status: "DISBURSED",
    applied_date: loan3AppliedDate,
    approved_date: dayjs(loan3AppliedDate).add(1, "day").format("YYYY-MM-DD"),
    disbursed_date: dayjs(loan3AppliedDate).add(2, "day").format("YYYY-MM-DD"),
    reviewed_by: loanOfficer.id,
    outstanding_principal: 400_000_000,
    created_by: teller.id,
  });
  const schedule3 = generateAmortizationSchedule({
    principal: loan3.principal,
    ratePercentPerYear: loan3.interest_rate,
    termMonths: loan3.term_months,
    startDate: loan3.disbursed_date,
  });
  // Kỳ đầu tiên đã quá hạn nhưng chưa trả -> đánh dấu OVERDUE
  schedule3[0].status = "OVERDUE";
  for (const period of schedule3) {
    await LoanRepaymentSchedule.create({ loan_id: loan3.id, ...period });
  }
  loan3.status = "OVERDUE";
  loan3.monthly_payment = schedule3[0].total_due;
  await loan3.save();
  await Transaction.create({
    receipt_no: genReceiptNo(),
    type: "LOAN_DISBURSEMENT",
    customer_id: customers[7].id,
    reference_code: loan3.loan_code,
    amount: loan3.principal,
    description: `Giải ngân khoản vay ${loan3.loan_code}`,
    performed_by: teller.id,
    transaction_date: dayjs(loan3.disbursed_date).toDate(),
  });

  console.log("🔔 Tạo thông báo mẫu...");
  await Notification.create({
    target_role: "LOAN_OFFICER",
    type: "LOAN_OVERDUE",
    title: "Khoản vay quá hạn",
    message: `Khoản vay ${loan3.loan_code} của khách hàng ${customers[7].full_name} đã quá hạn thanh toán.`,
    reference_code: loan3.loan_code,
  });
  await Notification.create({
    target_role: "LOAN_OFFICER",
    type: "SYSTEM",
    title: "Hồ sơ vay mới cần thẩm định",
    message: `Có 1 hồ sơ vay kinh doanh đang chờ thẩm định.`,
  });

  console.log("📝 Ghi audit log khởi tạo...");
  await AuditLog.create({
    user_id: admin.id,
    username: admin.username,
    action: "USER_CREATE",
    level: "INFO",
    description: "Khởi tạo dữ liệu hệ thống ban đầu (seed).",
  });

  console.log("\n✅ Seed dữ liệu hoàn tất!\n");
  console.log("Tài khoản đăng nhập demo:");
  console.log("  Admin        -> username: admin        | password: Admin@123");
  console.log("  Teller       -> username: teller1       | password: Teller@123");
  console.log("  Loan Officer -> username: loanofficer1  | password: Loan@123");
  console.log("  Manager      -> username: manager1      | password: Manager@123\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Lỗi khi seed dữ liệu:", err);
  process.exit(1);
});
