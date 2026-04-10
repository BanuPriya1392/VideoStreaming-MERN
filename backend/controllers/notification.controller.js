const Notification = require("../models/Notification");

async function getUserNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    return next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (err) {
    return next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    return next(err);
  }
}

async function clearAllNotifications(req, res, next) {
  try {
    await Notification.deleteMany({ user: req.user._id });
    return res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
};
