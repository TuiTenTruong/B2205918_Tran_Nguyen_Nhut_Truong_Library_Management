const notificationService = require("../services/notification.service");

exports.getMyNotifications = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const includeRead = req.query.includeRead === "true";

		await notificationService.checkNotificationsForUser(MaDocGia);

		const notifications =
			await notificationService.getNotificationsByUserWithDetails(
				MaDocGia,
				includeRead
			);

		return res.status(200).json({
			success: true,
			message: "Lấy danh sách thông báo thành công",
			count: notifications.length,
			data: notifications,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách thông báo",
			error: error.message,
		});
	}
};

// Lấy số thông báo chưa đọc của user
exports.getMyUnreadCount = async (req, res) => {
	try {
		const MaDocGia = req.userId;

		// Tự động kiểm tra và tạo thông báo mới cho user này
		await notificationService.checkNotificationsForUser(MaDocGia);

		const count = await notificationService.getUnreadCount(
			MaDocGia,
			"user"
		);

		return res.status(200).json({
			success: true,
			data: { unreadCount: count },
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy số thông báo chưa đọc",
			error: error.message,
		});
	}
};

// Đánh dấu đã đọc (user)
exports.markAsRead = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const MaThongBao = req.params.id;

		const notification = await notificationService.markAsRead(
			MaThongBao,
			MaDocGia
		);

		return res.status(200).json({
			success: true,
			message: "Đánh dấu đã đọc thành công",
			data: notification,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi đánh dấu đã đọc",
			error: error.message,
		});
	}
};

// Đánh dấu tất cả đã đọc (user)
exports.markAllAsRead = async (req, res) => {
	try {
		const MaDocGia = req.userId;

		const result = await notificationService.markAllAsRead(
			MaDocGia,
			"user"
		);

		return res.status(200).json({
			success: true,
			message: "Đánh dấu tất cả đã đọc thành công",
			data: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi đánh dấu tất cả đã đọc",
			error: error.message,
		});
	}
};

// Xóa thông báo (user)
exports.deleteNotification = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const MaThongBao = req.params.id;

		const result = await notificationService.deleteNotification(
			MaThongBao,
			MaDocGia
		);

		return res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi xóa thông báo",
			error: error.message,
		});
	}
};
// Lấy thông báo cho admin
exports.getAdminNotifications = async (req, res) => {
	try {
		const includeRead = req.query.includeRead === "true";

		const notifications =
			await notificationService.getNotificationsForAdmin(includeRead);

		return res.status(200).json({
			success: true,
			message: "Lấy danh sách thông báo admin thành công",
			count: notifications.length,
			data: notifications,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách thông báo admin",
			error: error.message,
		});
	}
};

// Lấy số thông báo chưa đọc của admin
exports.getAdminUnreadCount = async (req, res) => {
	try {
		const count = await notificationService.getUnreadCountForAdmin();

		return res.status(200).json({
			success: true,
			data: { unreadCount: count },
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy số thông báo chưa đọc",
			error: error.message,
		});
	}
};

// Đánh dấu đã đọc (admin)
exports.adminMarkAsRead = async (req, res) => {
	try {
		const MaThongBao = req.params.id;

		const notification = await notificationService.markAsRead(MaThongBao);

		return res.status(200).json({
			success: true,
			message: "Đánh dấu đã đọc thành công",
			data: notification,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi đánh dấu đã đọc",
			error: error.message,
		});
	}
};

// Đánh dấu tất cả đã đọc (admin)
exports.adminMarkAllAsRead = async (req, res) => {
	try {
		const result = await notificationService.markAllAdminAsRead();

		return res.status(200).json({
			success: true,
			message: "Đánh dấu tất cả đã đọc thành công",
			data: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi đánh dấu tất cả đã đọc",
			error: error.message,
		});
	}
};

// Xóa thông báo (admin)
exports.adminDeleteNotification = async (req, res) => {
	try {
		const MaThongBao = req.params.id;

		const result = await notificationService.deleteNotification(MaThongBao);

		return res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi xóa thông báo",
			error: error.message,
		});
	}
};

// Chạy kiểm tra và tạo thông báo tự động
exports.runNotificationChecks = async (req, res) => {
	try {
		const results = await notificationService.runAllNotificationChecks();

		return res.status(200).json({
			success: true,
			message: "Kiểm tra và tạo thông báo thành công",
			data: results,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi kiểm tra và tạo thông báo",
			error: error.message,
		});
	}
};

// Test gửi email nhắc nhở (for testing only)
exports.testSendEmails = async (req, res) => {
	try {
		const emailScheduler = require("../services/emailScheduler.service");
		
		const dueDateResults = await emailScheduler.sendDueDateReminders();
		const overdueResults = await emailScheduler.sendOverdueReminders();

		return res.status(200).json({
			success: true,
			message: "Đã gửi email test thành công",
			data: {
				dueDateReminders: dueDateResults,
				overdueReminders: overdueResults,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi gửi email test",
			error: error.message,
		});
	}
};
