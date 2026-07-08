const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
      company: req.user.company._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};