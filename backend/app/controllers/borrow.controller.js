const borrowService = require("../services/borrow.service");

// Tạo phiếu mượn sách mới
exports.createBorrow = async (req, res) => {
	try {
		const result = await borrowService.createBorrow(req.body);
		return res.status(201).json({
			success: true,
			message: "Tạo phiếu mượn sách thành công",
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
			message: "Lỗi tạo phiếu mượn sách",
			error: error.message,
		});
	}
};

// Lấy tất cả phiếu mượn
exports.getAllBorrows = async (req, res) => {
	try {
		const filters = {
			MaDocGia: req.query.MaDocGia,
			MaSach: req.query.MaSach,
			TinhTrang: req.query.TinhTrang,
			NhanVienXuLy: req.query.NhanVienXuLy,
		};

		const borrows = await borrowService.getAllBorrows(filters);
		return res.status(200).json({
			success: true,
			message: "Lấy danh sách phiếu mượn thành công",
			count: borrows.length,
			data: borrows,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách phiếu mượn",
			error: error.message,
		});
	}
};

// Lấy phiếu mượn theo ID
exports.getBorrowById = async (req, res) => {
	try {
		const borrow = await borrowService.getBorrowById(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Lấy thông tin phiếu mượn thành công",
			data: borrow,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin phiếu mượn",
			error: error.message,
		});
	}
};

// Lấy phiếu mượn theo độc giả
exports.getBorrowsByReader = async (req, res) => {
	try {
		const borrows = await borrowService.getBorrowsByReader(req.params.readerId);
		return res.status(200).json({
			success: true,
			message: "Lấy danh sách phiếu mượn của độc giả thành công",
			count: borrows.length,
			data: borrows,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách phiếu mượn của độc giả",
			error: error.message,
		});
	}
};

// Lấy phiếu mượn theo sách
exports.getBorrowsByBook = async (req, res) => {
	try {
		const borrows = await borrowService.getBorrowsByBook(req.params.bookId);
		return res.status(200).json({
			success: true,
			message: "Lấy lịch sử mượn sách thành công",
			count: borrows.length,
			data: borrows,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy lịch sử mượn sách",
			error: error.message,
		});
	}
};

// Trả sách
exports.returnBook = async (req, res) => {
	try {
		const { NgayTraThucTe } = req.body;
		const borrow = await borrowService.returnBook(req.params.id, NgayTraThucTe);
		return res.status(200).json({
			success: true,
			message: "Trả sách thành công",
			data: borrow,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi trả sách",
			error: error.message,
		});
	}
};

// Cập nhật phiếu mượn
exports.updateBorrow = async (req, res) => {
	try {
		const borrow = await borrowService.updateBorrow(req.params.id, req.body);
		return res.status(200).json({
			success: true,
			message: "Cập nhật phiếu mượn thành công",
			data: borrow,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi cập nhật phiếu mượn",
			error: error.message,
		});
	}
};

// Xóa phiếu mượn
exports.deleteBorrow = async (req, res) => {
	try {
		await borrowService.deleteBorrow(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Xóa phiếu mượn thành công",
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi xóa phiếu mượn",
			error: error.message,
		});
	}
};

// Lấy danh sách sách quá hạn
exports.getOverdueBorrows = async (req, res) => {
	try {
		const borrows = await borrowService.getOverdueBorrows();
		return res.status(200).json({
			success: true,
			message: "Lấy danh sách sách quá hạn thành công",
			count: borrows.length,
			data: borrows,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách sách quá hạn",
			error: error.message,
		});
	}
};

// Thống kê mượn sách
exports.getBorrowStatistics = async (req, res) => {
	try {
		const statistics = await borrowService.getBorrowStatistics();
		return res.status(200).json({
			success: true,
			message: "Lấy thống kê mượn sách thành công",
			data: statistics,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thống kê mượn sách",
			error: error.message,
		});
	}
};
