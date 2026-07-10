const router = require("express").Router();
const ctrl = require("../controllers/transactionController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

router.get("/", authorize(...Object.values(ROLES)), ctrl.list);
router.get("/:id/receipt", authorize(...Object.values(ROLES)), ctrl.getReceipt);

module.exports = router;
