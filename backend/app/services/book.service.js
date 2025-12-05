const Sach = require("../models/book.model");
const ApiError = require("../api-error");

class BookService {
	// Tạo sách mới
	async createBook(bookData, file) {
		const { TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc_TacGia, MoTa } =
			bookData;

		const newBook = new Sach({
			TenSach,
			DonGia,
			SoQuyen,
			NamXuatBan,
			MaNXB,
			NguonGoc_TacGia,
			MoTa,
			AnhBia: file ? file.filename : undefined,
		});

		await newBook.save();
		return newBook;
	}

	// Lấy tất cả sách (không bị xóa)
	async getAllBooks(filters = {}) {
		const query = { DaXoa: false };

		// Thêm filters nếu có
		if (filters.NguonGoc_TacGia) {
			query.NguonGoc_TacGia = {
				$regex: filters.NguonGoc_TacGia,
				$options: "i",
			};
		}
		if (filters.MaNXB) {
			query.MaNXB = filters.MaNXB;
		}
		if (filters.NamXuatBan) {
			query.NamXuatBan = filters.NamXuatBan;
		}

		const books = await Sach.find(query).sort({ createdAt: -1 });
		return books;
	}

	// Lấy sách theo ID
	async getBookById(MaSach) {
		const book = await Sach.findOne({ MaSach, DaXoa: false });
		if (!book) {
			throw new ApiError(404, "Không tìm thấy sách");
		}
		return book;
	}

	// Cập nhật sách
	async updateBook(MaSach, bookData, file) {
		const book = await Sach.findOne({ MaSach, DaXoa: false });
		if (!book) {
			throw new ApiError(404, "Không tìm thấy sách");
		}

		const { TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc_TacGia, MoTa } =
			bookData;

		if (TenSach) book.TenSach = TenSach;
		if (DonGia !== undefined) book.DonGia = DonGia;
		if (SoQuyen !== undefined) book.SoQuyen = SoQuyen;
		if (NamXuatBan) book.NamXuatBan = NamXuatBan;
		if (MaNXB) book.MaNXB = MaNXB;
		if (NguonGoc_TacGia) book.NguonGoc_TacGia = NguonGoc_TacGia;
		if (MoTa) book.MoTa = MoTa;
		if (file) book.AnhBia = file.filename;

		await book.save();
		return book;
	}

	// Xóa mềm sách
	async deleteBook(MaSach) {
		const book = await Sach.findOne({ MaSach, DaXoa: false });
		if (!book) {
			throw new ApiError(404, "Không tìm thấy sách");
		}

		book.DaXoa = true;
		await book.save();
		return book;
	}

	// Xóa nhiều sách
	async deleteMultipleBooks(MaSachArray) {
		const result = await Sach.updateMany(
			{ MaSach: { $in: MaSachArray }, DaXoa: false },
			{ DaXoa: true }
		);

		if (result.modifiedCount === 0) {
			throw new ApiError(404, "Không tìm thấy sách để xóa");
		}

		return {
			message: `Đã xóa ${result.modifiedCount} sách`,
			deletedCount: result.modifiedCount,
		};
	}

	// Tìm kiếm sách
	async searchBooks(keyword) {
		const books = await Sach.find({
			DaXoa: false,
			$or: [
				{ TenSach: { $regex: keyword, $options: "i" } },
				{ NguonGoc_TacGia: { $regex: keyword, $options: "i" } },
				{ MaNXB: { $regex: keyword, $options: "i" } },
			],
		}).sort({ createdAt: -1 });

		return books;
	}
}

module.exports = new BookService();
