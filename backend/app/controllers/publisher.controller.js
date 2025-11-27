const publisherService = require("../services/publisher.service");

// Tạo nhà xuất bản mới
exports.createPublisher = async (req, res) => {
	try {
		const result = await publisherService.createPublisher(req.body);
		return res.status(201).json({
			success: true,
			message: "Tạo nhà xuất bản thành công",
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
			message: "Lỗi tạo nhà xuất bản",
			error: error.message,
		});
	}
};

// Lấy tất cả nhà xuất bản
exports.getAllPublishers = async (req, res) => {
	try {
		const filters = {
			TenNXB: req.query.TenNXB,
			DiaChi: req.query.DiaChi,
		};

		const publishers = await publisherService.getAllPublishers(filters);
		return res.status(200).json({
			success: true,
			message: "Lấy danh sách nhà xuất bản thành công",
			count: publishers.length,
			data: publishers,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy danh sách nhà xuất bản",
			error: error.message,
		});
	}
};

// Lấy nhà xuất bản theo ID
exports.getPublisherById = async (req, res) => {
	try {
		const publisher = await publisherService.getPublisherById(
			req.params.id
		);
		return res.status(200).json({
			success: true,
			message: "Lấy thông tin nhà xuất bản thành công",
			data: publisher,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin nhà xuất bản",
			error: error.message,
		});
	}
};

// Cập nhật nhà xuất bản
exports.updatePublisher = async (req, res) => {
	try {
		const publisher = await publisherService.updatePublisher(
			req.params.id,
			req.body
		);
		return res.status(200).json({
			success: true,
			message: "Cập nhật nhà xuất bản thành công",
			data: publisher,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi cập nhật nhà xuất bản",
			error: error.message,
		});
	}
};

// Xóa nhà xuất bản
exports.deletePublisher = async (req, res) => {
	try {
		await publisherService.deletePublisher(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Xóa nhà xuất bản thành công",
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi xóa nhà xuất bản",
			error: error.message,
		});
	}
};

// Tìm kiếm nhà xuất bản
exports.searchPublishers = async (req, res) => {
	try {
		const { keyword } = req.query;
		if (!keyword) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập từ khóa tìm kiếm",
			});
		}

		const publishers = await publisherService.searchPublishers(keyword);
		return res.status(200).json({
			success: true,
			message: "Tìm kiếm nhà xuất bản thành công",
			count: publishers.length,
			data: publishers,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi tìm kiếm nhà xuất bản",
			error: error.message,
		});
	}
};

// Lấy thống kê về nhà xuất bản
exports.getPublisherStats = async (req, res) => {
	try {
		const stats = await publisherService.getPublisherStats(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Lấy thống kê nhà xuất bản thành công",
			data: stats,
		});
	} catch (error) {
		if (error.statusCode) {
			return res
				.status(error.statusCode)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thống kê nhà xuất bản",
			error: error.message,
		});
	}
};
