const router = require("express").Router();
const ctrl = require("../controllers/loanController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const ALL_ROLES = Object.values(ROLES);
const LOAN_MANAGE_ROLES = [ROLES.ADMIN, ROLES.LOAN_OFFICER];
const REPAY_ROLES = [ROLES.ADMIN, ROLES.TELLER, ROLES.LOAN_OFFICER];

router.get("/statistics", authorize(...ALL_ROLES), ctrl.statistics);
router.get("/", authorize(...ALL_ROLES), ctrl.list);
router.get("/:id", authorize(...ALL_ROLES), ctrl.getById);
router.post("/", authorize(ROLES.ADMIN, ROLES.TELLER, ROLES.LOAN_OFFICER), ctrl.apply);
router.post("/:id/approve", authorize(...LOAN_MANAGE_ROLES), ctrl.approve);
router.post("/:id/reject", authorize(...LOAN_MANAGE_ROLES), ctrl.reject);
router.post("/:id/disburse", authorize(...LOAN_MANAGE_ROLES), ctrl.disburse);
router.post("/:id/repay", authorize(...REPAY_ROLES), ctrl.repay);
router.post("/:id/settle", authorize(...REPAY_ROLES), ctrl.settle);
router.post("/detect-overdue", authorize(ROLES.ADMIN, ROLES.LOAN_OFFICER), ctrl.detectOverdue);

module.exports = router;
