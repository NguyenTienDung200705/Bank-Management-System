const router = require("express").Router();
const ctrl = require("../controllers/savingController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const ALL_ROLES = Object.values(ROLES);
const OPS_ROLES = [ROLES.ADMIN, ROLES.TELLER];

router.get("/", authorize(...ALL_ROLES), ctrl.list);
router.get("/:id", authorize(...ALL_ROLES), ctrl.getById);
router.post("/", authorize(...OPS_ROLES), ctrl.open);
router.post("/:id/deposit", authorize(...OPS_ROLES), ctrl.deposit);
router.post("/:id/withdraw", authorize(...OPS_ROLES), ctrl.withdraw);
router.post("/:id/close", authorize(...OPS_ROLES), ctrl.close);
router.post("/:id/renew", authorize(...OPS_ROLES), ctrl.renew);

module.exports = router;
