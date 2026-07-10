const router = require("express").Router();
const ctrl = require("../controllers/auditController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

router.get("/", authorize(ROLES.ADMIN), ctrl.list);

module.exports = router;
