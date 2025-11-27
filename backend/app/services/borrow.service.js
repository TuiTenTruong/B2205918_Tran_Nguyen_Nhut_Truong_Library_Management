const TheoDoiMuonSach = require("../models/borrow.model");
const Sach = require("../models/book.model");
const DocGia = require("../models/reader.model");
const ApiError = require("../api-error");

class BorrowService {
	// Tạo phiếu mượn sách mới
	async createBorrow(borrowData) {
		const { MaDocGia, MaSach, NgayMuon, NgayTra, NhanVienXuLy } =
			borrowData;

		const reader = await DocGia.findOne({ MaDocGia });
		if (!reader) {
			throw new ApiError(404, "Không tìm thấy độc giả");
		}

		const book = await Sach.findOne({ MaSach, DaXoa: false });
		if (!book) {
			throw new ApiError(404, "Không tìm thấy sách");
		}
		if (book.SoQuyen <= 0) {
			throw new ApiError(400, "Sách đã hết");
		}

		const existingBorrow = await TheoDoiMuonSach.findOne({
			MaDocGia,
			MaSach,
			TinhTrang: "Đang mượn",
		});
		if (existingBorrow) {
			throw new ApiError(400, "Độc giả đang mượn sách này");
		}

		const newBorrow = new TheoDoiMuonSach({
			MaDocGia,
			MaSach,
			NgayMuon: NgayMuon || new Date(),
			NgayTra,
			NhanVienXuLy,
			TinhTrang: "Đang mượn",
		});

		await newBorrow.save();

		book.SoQuyen -= 1;
		await book.save();

		reader.Muon.push({
			MASACH: newBorrow.MaSach,
			NGAYMUON: newBorrow.NgayMuon,
			NGAYTRA: newBorrow.NgayTra || null,
			TRANGTHAI: newBorrow.TinhTrang,
		});
		await reader.save();

		return newBorrow;
	}

	// Lấy tất cả phiếu mượn
	async getAllBorrows(filters = {}) {
		const query = {};

		// Thêm filters
		if (filters.MaDocGia) {
			query.MaDocGia = filters.MaDocGia;
		}
		if (filters.MaSach) {
			query.MaSach = filters.MaSach;
		}
		if (filters.TinhTrang) {
			query.TinhTrang = filters.TinhTrang;
		}
		if (filters.NhanVienXuLy) {
			query.NhanVienXuLy = filters.NhanVienXuLy;
		}

		const borrows = await TheoDoiMuonSach.find(query)
			.sort({ createdAt: -1 })
			.lean();

		return borrows;
	}

	// Lấy phiếu mượn theo ID
	async getBorrowById(MaPhieuMuon) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon }).lean();
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}
		return borrow;
	}

	// Lấy phiếu mượn theo độc giả
	async getBorrowsByReader(MaDocGia) {
		const borrows = await TheoDoiMuonSach.find({ MaDocGia })
			.sort({ createdAt: -1 })
			.lean();
		return borrows;
	}

	// Lấy phiếu mượn theo sách
	async getBorrowsByBook(MaSach) {
		const borrows = await TheoDoiMuonSach.find({ MaSach })
			.sort({ createdAt: -1 })
			.lean();
		return borrows;
	}

	// Trả sách
	async returnBook(MaPhieuMuon, NgayTraThucTe) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		if (borrow.TinhTrang === "Đã trả") {
			throw new ApiError(400, "Sách đã được trả");
		}

		// Tìm sách và tăng số quyển
		const book = await Sach.findOne({ MaSach: borrow.MaSach });
		if (book) {
			book.SoQuyen += 1;
			await book.save();
		}

		// Cập nhật trạng thái
		borrow.TinhTrang = "Đã trả";
		borrow.NgayTraThucTe = NgayTraThucTe || new Date();
		await borrow.save();

		return borrow;
	}

	// Cập nhật phiếu mượn
	async updateBorrow(MaPhieuMuon, borrowData) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		const { NgayMuon, NgayTra, TinhTrang, NhanVienXuLy } = borrowData;

		if (NgayMuon) borrow.NgayMuon = NgayMuon;
		if (NgayTra) borrow.NgayTra = NgayTra;
		if (TinhTrang) borrow.TinhTrang = TinhTrang;
		if (NhanVienXuLy) borrow.NhanVienXuLy = NhanVienXuLy;

		await borrow.save();
		return borrow;
	}

	// Xóa phiếu mượn
	async deleteBorrow(MaPhieuMuon) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		// Nếu đang mượn thì tăng lại số quyển sách
		if (borrow.TinhTrang === "Đang mượn") {
			const book = await Sach.findOne({ MaSach: borrow.MaSach });
			if (book) {
				book.SoQuyen += 1;
				await book.save();
			}
		}

		await TheoDoiMuonSach.updateOne({ MaPhieuMuon }, { DaXoa: true });
		return { message: "Xóa phiếu mượn thành công" };
	}

	// Lấy danh sách sách quá hạn
	async getOverdueBorrows() {
		const now = new Date();
		const borrows = await TheoDoiMuonSach.find({
			TinhTrang: "Đang mượn",
			NgayTra: { $lt: now },
		})
			.sort({ NgayTra: 1 })
			.lean();

		// Cập nhật tình trạng quá hạn
		for (const borrow of borrows) {
			await TheoDoiMuonSach.updateOne(
				{ MaPhieuMuon: borrow.MaPhieuMuon },
				{ TinhTrang: "Quá hạn" }
			);
			borrow.TinhTrang = "Quá hạn";
		}

		return borrows;
	}

	// Thống kê mượn sách
	async getBorrowStatistics() {
		const total = await TheoDoiMuonSach.countDocuments();
		const dangMuon = await TheoDoiMuonSach.countDocuments({
			TinhTrang: "Đang mượn",
		});
		const daTra = await TheoDoiMuonSach.countDocuments({
			TinhTrang: "Đã trả",
		});
		const quaHan = await TheoDoiMuonSach.countDocuments({
			TinhTrang: "Quá hạn",
		});

		return {
			total,
			dangMuon,
			daTra,
			quaHan,
		};
	}
}

module.exports = new BorrowService();
