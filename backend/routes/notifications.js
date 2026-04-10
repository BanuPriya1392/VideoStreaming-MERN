const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} = require("../controllers/notification.controller");

router.use(protect);

router.get("/", getUserNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/", clearAllNotifications);

module.exports = router;
