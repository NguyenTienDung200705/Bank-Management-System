const router = require("express").Router();
const ctrl = require("../controllers/notificationController");

router.get("/", ctrl.list);
router.get("/unread-count", ctrl.unreadCount);
router.post("/:id/read", ctrl.markRead);
router.post("/read-all", ctrl.markAllRead);

module.exports = router;
