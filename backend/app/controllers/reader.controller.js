const readerService = require("../services/reader.service");

exports.registerReader = async (req, res) => {
	try {
		const result = await readerService.register(req.body);
		return res.status(201).json({
			success: true,
			message: "Đăng ký độc giả thành công",
			data: result,
		});
	} catch (error) {
		if (error.statusCode === 409) {
			return res
				.status(409)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi đăng ký độc giả",
			error: error.message,
		});
	}
};

exports.loginReader = async (req, res) => {
	try {
		const result = await readerService.login(req.body);
		return res.status(200).json({
			success: true,
			message: "Đăng nhập độc giả thành công",
			data: result,
		});
	} catch (error) {
		if (error.statusCode === 409) {
			return res
				.status(409)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi đăng nhập độc giả",
			error: error.message,
		});
	}
};

exports.getMyProfile = async (req, res) => {
	try {
		const userId = req.userId;
		console.log(userId);
		const reader = await readerService.getReaderById(userId);
		if (!reader) {
			return res
				.status(404)
				.json({ success: false, message: "Độc giả không tồn tại" });
		}
		return res.status(200).json({ success: true, data: reader });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin độc giả",
			error: error.message,
		});
	}
};

exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.params.id;
		const reader = await readerService.getReaderById(userId);
		if (!reader) {
			return res
				.status(404)
				.json({ success: false, message: "Độc giả không tồn tại" });
		}
		return res.status(200).json({ success: true, data: reader });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin độc giả",
			error: error.message,
		});
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const reader = await readerService.updateReader(req.userId, req.body);

		res.status(200).json({
			success: true,
			message: "Cập nhật thành công",
			data: reader,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};

exports.deleteReader = async (req, res) => {
	try {
		const result = await readerService.deleteReader(req.params.id);

		res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getAllReaders = async (req, res) => {
	try {
		const filters = {
			page: req.query.page,
			limit: req.query.limit,
			search: req.query.search,
		};

		const result = await readerService.getAllReaders(filters);

		res.status(200).json({
			success: true,
			data: result.readers,
			pagination: result.pagination,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateReaderByAdmin = async (req, res) => {
	try {
		const reader = await readerService.updateReaderByAdmin(
			req.params.id,
			req.body
		);

		res.status(200).json({
			success: true,
			message: "Cập nhật thành công",
			data: reader,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};
exports.toggleFavoriteBook = async (req, res) => {
	try {
		const MaDocGia = req.userId;
		const { bookId } = req.params;

		const result = await readerService.toggleFavoriteBook(MaDocGia, bookId);

		return res.status(200).json({
			success: true,
			message: result.isLiked ? "Đã thích sách" : "Đã bỏ thích sách",
			data: result,
		});
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Lỗi khi cập nhật yêu thích",
		});
	}
};

exports.getFavoriteBooks = async (req, res) => {
	try {
		const MaDocGia = req.userId;

		const books = await readerService.getFavoriteBooks(MaDocGia);

		return res.status(200).json({
			success: true,
			message: "Lấy danh sách sách yêu thích thành công",
			data: books,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách sách yêu thích",
			error: error.message,
		});
	}
};
