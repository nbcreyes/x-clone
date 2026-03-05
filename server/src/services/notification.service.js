import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// Standard notification select reused across all queries
const notificationSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      id: true,
      content: true,
    },
  },
  reply: {
    select: {
      id: true,
      content: true,
    },
  },
};

/**
 * Creates a notification.
 * Skips creation if the sender and recipient are the same user
 * since you do not need a notification for your own actions.
 *
 * @param {object} data - { type, recipientId, senderId, postId?, replyId? }
 * @returns {object|null} - The created notification or null if skipped
 */
const createNotification = async ({
  type,
  recipientId,
  senderId,
  postId,
  replyId,
}) => {
  // Do not notify users of their own actions
  if (recipientId === senderId) return null;

  const notification = await prisma.notification.create({
    data: {
      type,
      recipientId,
      senderId,
      postId: postId || null,
      replyId: replyId || null,
    },
    select: notificationSelect,
  });

  return notification;
};

/**
 * Returns paginated notifications for the current user.
 * Ordered by newest first.
 *
 * @param {string} userId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { notifications, nextCursor, unreadCount }
 */
const getNotifications = async (userId, { cursor, limit = 20 } = {}) => {
  const take = Math.min(Number(limit), 50);

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: notificationSelect,
  });

  const hasNextPage = notifications.length > take;
  const trimmed = hasNextPage ? notifications.slice(0, take) : notifications;
  const nextCursor = hasNextPage ? trimmed[trimmed.length - 1].id : null;

  // Get the unread count so the frontend can show a badge
  const unreadCount = await prisma.notification.count({
    where: { recipientId: userId, read: false },
  });

  return { notifications: trimmed, nextCursor, unreadCount };
};

/**
 * Marks a single notification as read.
 *
 * @param {string} notificationId
 * @param {string} userId - Must match the recipientId
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { recipientId: true },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.recipientId !== userId) {
    throw new AppError("You are not authorized to update this notification", 403);
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

/**
 * Marks all notifications as read for the current user.
 *
 * @param {string} userId
 * @returns {number} - Count of notifications marked as read
 */
const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });

  return result.count;
};

/**
 * Returns the count of unread notifications for a user.
 * Used to show the notification badge in the UI.
 *
 * @param {string} userId
 * @returns {number}
 */
const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: { recipientId: userId, read: false },
  });
};

/**
 * Deletes a single notification.
 *
 * @param {string} notificationId
 * @param {string} userId - Must match the recipientId
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { recipientId: true },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.recipientId !== userId) {
    throw new AppError("You are not authorized to delete this notification", 403);
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });
};

export default {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};