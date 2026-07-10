const router = require("express").Router();
const ctrl = require("../controllers/userController");
const authorize = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

router.use(authorize(ROLES.ADMIN));

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/:id/lock", ctrl.lock);
router.post("/:id/unlock", ctrl.unlock);
router.post("/:id/reset-password", ctrl.resetPassword);

module.exports = router;
