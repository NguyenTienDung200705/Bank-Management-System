const router = require("express").Router();
const ctrl = require("../controllers/customerController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const ALL_ROLES = Object.values(ROLES);

router.get("/", authorize(...ALL_ROLES), ctrl.list);
router.get("/:id", authorize(...ALL_ROLES), ctrl.getById);
router.get("/:id/transactions", authorize(...ALL_ROLES), ctrl.getTransactions);
router.post("/", authorize(ROLES.ADMIN, ROLES.TELLER), ctrl.create);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TELLER), ctrl.update);
router.delete("/:id", authorize(ROLES.ADMIN), ctrl.remove);

module.exports = router;
