const router = require("express").Router();
const ctrl = require("../controllers/configController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

router.get("/", authorize(ROLES.ADMIN), ctrl.list);
router.put("/:key", authorize(ROLES.ADMIN), ctrl.update);

module.exports = router;
