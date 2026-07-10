const router = require("express").Router();
const authenticate = require("../middleware/auth");

router.use("/auth", require("./authRoutes"));

// Từ đây trở đi yêu cầu xác thực
router.use(authenticate);

router.use("/users", require("./userRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/savings", require("./savingRoutes"));
router.use("/loans", require("./loanRoutes"));
router.use("/interest-rates", require("./interestRoutes"));
router.use("/transactions", require("./transactionRoutes"));
router.use("/reports", require("./reportRoutes"));
router.use("/notifications", require("./notificationRoutes"));
router.use("/audit-logs", require("./auditRoutes"));
router.use("/configs", require("./configRoutes"));

module.exports = router;
