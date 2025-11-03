import readerService from "../services/reader.service";
export async function registerReader(req, res) {
	try {
		const result = await readerService.register(req.body);
		return res.status(201).json({
			success: true,
			message: "Đăng ký độc giả thành công",
			data: result,
		});
	} catch (error) {
		// Check if the error is a known "conflict" error from the service
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
}
export async function loginReader(req, res) {
	try {
		const result = await readerService.login(req.body);
		return res.status(200).json({
			success: true,
			message: "Đăng nhập độc giả thành công",
			data: result,
		});
	} catch (error) {
		// Check if the error is a known "conflict" error from the service
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
}

export async function getMyProfile(req, res) {
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
}
export async function getUserProfile(req, res) {
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
}
export async function updateProfile(req, res) {
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
}
export async function deleteReader(req, res) {
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
}
export async function getAllReaders(req, res) {
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
}
