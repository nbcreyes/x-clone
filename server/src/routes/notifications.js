import { Router } from "express";
import notificationController from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All notification routes require auth
router.use(requireAuth);

// GET /api/notifications - get paginated notifications
router.get("/", notificationController.getNotifications);

// GET /api/notifications/unread-count - get unread badge count
// Must be defined before /:id to avoid route conflicts
router.get("/unread-count", notificationController.getUnreadCount);

// PATCH /api/notifications/read-all - mark all as read
// Must be defined before /:id to avoid route conflicts
router.patch("/read-all", notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read - mark one as read
router.patch("/:id/read", notificationController.markAsRead);

// DELETE /api/notifications/:id - delete one notification
router.delete("/:id", notificationController.deleteNotification);

export default router;