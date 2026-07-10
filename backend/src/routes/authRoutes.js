const router = require("express").Router();
const ctrl = require("../controllers/authController");
const authenticate = require("../middleware/auth");

router.post("/login", ctrl.login);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);

router.use(authenticate);
router.post("/logout", ctrl.logout);
router.get("/me", ctrl.me);
router.post("/change-password", ctrl.changePassword);
router.put("/profile", ctrl.updateProfile);

module.exports = router;
