const { Router } = require("express");
const router = Router();
const NotificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

router.get("/my", authenticate, NotificationController.getMyNotifications);

router.get(
	"/my/unread-count",
	authenticate,
	NotificationController.getMyUnreadCount
);

router.put("/my/read-all", authenticate, NotificationController.markAllAsRead);

router.put("/my/:id/read", authenticate, NotificationController.markAsRead);

router.delete(
	"/my/:id",
	authenticate,
	NotificationController.deleteNotification
);

router.get(
	"/admin",
	authenticate,
	isAdmin,
	NotificationController.getAdminNotifications
);

router.get(
	"/admin/unread-count",
	authenticate,
	isAdmin,
	NotificationController.getAdminUnreadCount
);

router.put(
	"/admin/read-all",
	authenticate,
	isAdmin,
	NotificationController.adminMarkAllAsRead
);

router.put(
	"/admin/:id/read",
	authenticate,
	isAdmin,
	NotificationController.adminMarkAsRead
);

router.delete(
	"/admin/:id",
	authenticate,
	isAdmin,
	NotificationController.adminDeleteNotification
);

router.post(
	"/check",
	authenticate,
	isAdmin,
	NotificationController.runNotificationChecks
);

router.post(
	"/test-emails",
	authenticate,
	isAdmin,
	NotificationController.testSendEmails
);

module.exports = router;
