const router = require("express").Router();
const ctrl = require("../controllers/interestController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

router.get("/", authorize(...Object.values(ROLES)), ctrl.list);
router.post("/", authorize(ROLES.ADMIN), ctrl.create);
router.put("/:id", authorize(ROLES.ADMIN), ctrl.update);

module.exports = router;
