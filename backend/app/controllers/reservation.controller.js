const reservationService = require("../services/reservation.service");

// User đặt trước sách
exports.createReservation = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const { MaSach } = req.body;

		if (!MaSach) {
			return res.status(400).json({
				success: false,
				message: "Thiếu mã sách",
			});
		}

		const result = await reservationService.createReservation(
			MaDocGia,
			MaSach
		);

		return res.status(201).json({
			success: true,
			message: result.message,
			data: result,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi đặt trước sách",
			error: error.message,
		});
	}
};

// User lấy danh sách đặt trước của mình
exports.getMyReservations = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const reservations = await reservationService.getReservationsByReader(
			MaDocGia
		);

		return res.status(200).json({
			success: true,
			message: "Lấy danh sách đặt trước thành công",
			count: reservations.length,
			data: reservations,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách đặt trước",
			error: error.message,
		});
	}
};

// User hủy đặt trước
exports.cancelReservation = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const { id } = req.params;

		const result = await reservationService.cancelReservation(id, MaDocGia);

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
			message: "Lỗi hủy đặt trước",
			error: error.message,
		});
	}
};

// User kiểm tra vị trí hàng đợi
exports.getQueuePosition = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const { MaSach } = req.params;

		const result = await reservationService.getQueuePosition(
			MaDocGia,
			MaSach
		);

		if (!result) {
			return res.status(404).json({
				success: false,
				message: "Bạn chưa đặt trước sách này",
			});
		}

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi kiểm tra vị trí hàng đợi",
			error: error.message,
		});
	}
};

// User lấy chi tiết đặt trước
exports.getReservationById = async (req, res) => {
	try {
		const { id } = req.params;
		const reservation = await reservationService.getReservationById(id);

		return res.status(200).json({
			success: true,
			data: reservation,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy chi tiết đặt trước",
			error: error.message,
		});
	}
};

// Admin lấy tất cả đặt trước
exports.getAllReservations = async (req, res) => {
	try {
		const filters = {
			TrangThai: req.query.TrangThai,
			MaSach: req.query.MaSach,
		};

		const reservations = await reservationService.getAllReservations(
			filters
		);

		return res.status(200).json({
			success: true,
			message: "Lấy danh sách đặt trước thành công",
			count: reservations.length,
			data: reservations,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách đặt trước",
			error: error.message,
		});
	}
};

// Admin lấy hàng đợi của một sách
exports.getQueueByBook = async (req, res) => {
	try {
		const { MaSach } = req.params;
		const queue = await reservationService.getQueueByBook(MaSach);

		return res.status(200).json({
			success: true,
			message: "Lấy hàng đợi sách thành công",
			count: queue.length,
			data: queue,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy hàng đợi sách",
			error: error.message,
		});
	}
};

// Admin hoàn tất đặt trước
exports.completeReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const { NgayTra } = req.body;
		const result = await reservationService.completeReservation(
			id,
			null,
			NgayTra
		);

		return res.status(200).json({
			success: true,
			message: "Hoàn tất đặt trước và tạo phiếu mượn thành công",
			data: {
				reservation: result.reservation,
				borrow: result.borrow,
			},
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi hoàn tất đặt trước",
			error: error.message,
		});
	}
};

// Admin hủy đặt trước
exports.adminCancelReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await reservationService.cancelReservation(id);

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
			message: "Lỗi hủy đặt trước",
			error: error.message,
		});
	}
};

// Admin xử lý các đơn hết hạn
exports.processExpiredReservations = async (req, res) => {
	try {
		const result = await reservationService.processExpiredReservations();

		return res.status(200).json({
			success: true,
			message: `Đã xử lý ${result.expiredCount} đơn đặt trước hết hạn`,
			data: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi xử lý đơn đặt trước hết hạn",
			error: error.message,
		});
	}
};

// Admin thống kê đặt trước
exports.getReservationStatistics = async (req, res) => {
	try {
		const stats = await reservationService.getReservationStatistics();

		return res.status(200).json({
			success: true,
			message: "Lấy thống kê đặt trước thành công",
			data: stats,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thống kê đặt trước",
			error: error.message,
		});
	}
};
