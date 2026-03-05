import notificationService from "../services/notification.service.js";

/**
 * GET /api/notifications
 * Returns paginated notifications for the current user.
 */
const getNotifications = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const result = await notificationService.getNotifications(req.user.id, {
      cursor,
      limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns the count of unread notifications.
 * Used to show the notification badge.
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.id);

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications as read for the current user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Deletes a single notification.
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user.id);

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};