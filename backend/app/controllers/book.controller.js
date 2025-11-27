const bookService = require("../services/book.service");

// Tạo sách mới
exports.createBook = async (req, res) => {
	try {
		const result = await bookService.createBook(req.body, req.file);
		return res.status(201).json({
			success: true,
			message: "Tạo sách thành công",
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
			message: "Lỗi tạo sách",
			error: error.message,
		});
	}
};

// Lấy tất cả sách
exports.getAllBooks = async (req, res) => {
	try {
		const filters = {
			NguonGoc_TacGia: req.query.NguonGoc_TacGia,
			MaNXB: req.query.MaNXB,
			NamXuatBan: req.query.NamXuatBan,
		};

		const books = await bookService.getAllBooks(filters);
		return res.status(200).json({
			success: true,
			message: "Lấy danh sách sách thành công",
			count: books.length,
			data: books,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách sách",
			error: error.message,
		});
	}
};

// Lấy sách theo ID
exports.getBookById = async (req, res) => {
	try {
		const book = await bookService.getBookById(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Lấy thông tin sách thành công",
			data: book,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin sách",
			error: error.message,
		});
	}
};

// Cập nhật sách
exports.updateBook = async (req, res) => {
	try {
		const book = await bookService.updateBook(
			req.params.id,
			req.body,
			req.file
		);
		return res.status(200).json({
			success: true,
			message: "Cập nhật sách thành công",
			data: book,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi cập nhật sách",
			error: error.message,
		});
	}
};

// Xóa sách (soft delete)
exports.deleteBook = async (req, res) => {
	try {
		await bookService.deleteBook(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Xóa sách thành công",
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi xóa sách",
			error: error.message,
		});
	}
};

// Xóa nhiều sách
exports.deleteMultipleBooks = async (req, res) => {
	try {
		const { MaSachArray } = req.body;
		if (!MaSachArray || !Array.isArray(MaSachArray)) {
			return res.status(400).json({
				success: false,
				message: "Danh sách mã sách không hợp lệ",
			});
		}

		const result = await bookService.deleteMultipleBooks(MaSachArray);
		return res.status(200).json({
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
			message: "Lỗi xóa sách",
			error: error.message,
		});
	}
};

// Tìm kiếm sách
exports.searchBooks = async (req, res) => {
	try {
		const { keyword } = req.query;
		if (!keyword) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập từ khóa tìm kiếm",
			});
		}

		const books = await bookService.searchBooks(keyword);

		return res.status(200).json({
			success: true,
			message: "Tìm kiếm sách thành công",
			count: books.length,
			data: books,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi tìm kiếm sách",
			error: error.message,
		});
	}
};
