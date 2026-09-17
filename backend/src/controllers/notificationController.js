import { Notification } from '../models/Notification.js';
import { checkExpiringCertificates } from '../services/cronService.js';

/**
 * @desc    Get notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manual trigger of daily expiry cron sweep (for testing & demo)
 * @route   POST /api/notifications/trigger-cron
 * @access  Private (Admin)
 */
export const triggerManualCronSweep = async (req, res, next) => {
  try {
    const result = await checkExpiringCertificates();
    res.json({ success: true, message: 'Expiry check sweep executed successfully', result });
  } catch (error) {
    next(error);
  }
};
