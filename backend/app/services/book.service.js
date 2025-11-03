// import Sach from "../models/book.model.js";
// import ApiError from "../api-error.js";
// class BookService {
// 	async createBook(bookData, file) {
// 		const {
// 			TenSach,
// 			DonGia,
// 			SoQuyen,
// 			NamXuatBan,
// 			MaNhaXuatBan,
// 			NguonGoc_TacGia,
// 		} = bookData;
// 		if (!file) {
// 			throw new ApiError(400, "Ảnh bìa là bắt buộc");
// 		}

// 		const newBook = new Sach({
// 			TenSach,
// 			DonGia,
// 			SoQuyen,
// 			NamXuatBan,
// 			MaNhaXuatBan,
// 			NguonGoc_TacGia,
// 			AnhBia: file.filename,
// 		});
// 		await newBook.save();
// 		return newBook;
// 	}
// }

// export default new BookService();
