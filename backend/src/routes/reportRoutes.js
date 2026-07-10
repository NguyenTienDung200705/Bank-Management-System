const router = require("express").Router();
const ctrl = require("../controllers/reportController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

router.use(authorize(...Object.values(ROLES)));
router.get("/summary", ctrl.summary);
router.get("/revenue", ctrl.revenue);
router.get("/savings", ctrl.savings);
router.get("/loans", ctrl.loans);
router.get("/customers", ctrl.customers);
router.get("/periodic", ctrl.periodic);

module.exports = router;
