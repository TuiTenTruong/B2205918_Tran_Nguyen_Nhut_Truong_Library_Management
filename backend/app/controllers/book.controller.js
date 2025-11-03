// const BookService = require("../services/book.service.js");
// const ApiError = require("../api-error.js");

// exports.createBook = async (req, res) => {
// 	try {
// 		const result = await BookService.createBook(req.body, req.file);
// 		return res.status(201).json({
// 			success: true,
// 			message: "Tạo sách thành công",
// 			data: result,
// 		});
// 	} catch (error) {
// 		if (error) {
// 			return res
// 				.status(error.statusCode)
// 				.json({ success: false, message: error.message });
// 		}
// 		return res.status(500).json({
// 			success: false,
// 			message: "Lỗi tạo sách",
// 			error: error.message,
// 		});
// 	}
// };
