const TheoDoiMuonSach = require("../models/borrow.model");
const Sach = require("../models/book.model");
const DocGia = require("../models/reader.model");
const ApiError = require("../api-error");

const MAX_BORROWED_BOOKS = 5;
const BORROW_DURATION_DAYS = 14;
const DAILY_FINE = 2000;
const LOST_FINE_MULTIPLIER = 1.5;
const BAN_DAYS_AFTER_LOST = 30;

class BorrowService {
	// Tạo phiếu mượn sách mới
	async createBorrow(borrowData) {
		const { MaDocGia, MaSach, NgayMuon, NgayTra } = borrowData;

		const reader = await DocGia.findOne({ MaDocGia, DaXoa: false });
		if (!reader) {
			throw new ApiError(404, "Không tìm thấy độc giả");
		}

		const now = new Date();
		const tienPhatChuaDong = reader.TienPhatChuaDong || 0;
		if (tienPhatChuaDong > 0) {
			throw new ApiError(400, "Độc giả còn tiền phạt chưa thanh toán");
		}

		if (reader.CamMuonDen && reader.CamMuonDen > now) {
			throw new ApiError(400, "Độc giả đang bị tạm khóa quyền mượn sách");
		}

		const hasOverdue = await TheoDoiMuonSach.exists({
			MaDocGia,
			TinhTrang: "Quá hạn",
		});
		if (hasOverdue) {
			throw new ApiError(400, "Độc giả còn sách quá hạn chưa trả");
		}

		const currentBorrowCount = await TheoDoiMuonSach.countDocuments({
			MaDocGia,
			TinhTrang: { $in: ["Đang mượn", "Quá hạn"] },
		});
		if (currentBorrowCount >= MAX_BORROWED_BOOKS) {
			throw new ApiError(400, "Độc giả đã mượn tối đa số sách cho phép");
		}

		const book = await Sach.findOne({ MaSach, DaXoa: false });
		if (!book) {
			throw new ApiError(404, "Không tìm thấy sách");
		}
		if (book.SoQuyen <= 0) {
			throw new ApiError(400, "Sách đã hết");
		}

		const existingBorrow = await TheoDoiMuonSach.exists({
			MaDocGia,
			MaSach,
			TinhTrang: { $in: ["Đang mượn", "Quá hạn"] },
		});
		if (existingBorrow) {
			throw new ApiError(400, "Độc giả đang mượn cuốn sách này");
		}

		const ngayMuon = NgayMuon ? new Date(NgayMuon) : now;
		let ngayTra;
		if (NgayTra) {
			ngayTra = new Date(NgayTra);
		} else {
			ngayTra = new Date(ngayMuon);
			ngayTra.setDate(ngayMuon.getDate() + BORROW_DURATION_DAYS);
		}

		const newBorrow = await TheoDoiMuonSach.create({
			MaDocGia,
			MaSach,
			NgayMuon: ngayMuon,
			NgayTra: ngayTra,
			NgayTraThucTe: null,
			TinhTrang: "Đang mượn",
			TienPhat: 0,
			DaThanhToanTienPhat: false,
		});

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
	async returnBook(MaPhieuMuon, data) {
		let NgayTraThucTe = null;
		let MatSach = false;

		if (data && typeof data === "object") {
			NgayTraThucTe = data.NgayTraThucTe;
			MatSach = !!data.MatSach;
		} else if (data) {
			NgayTraThucTe = data;
		}

		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		if (borrow.TinhTrang === "Đã trả" || borrow.TinhTrang === "Mất sách") {
			throw new ApiError(400, "Phiếu mượn đã được xử lý");
		}

		const reader = await DocGia.findOne({ MaDocGia: borrow.MaDocGia });
		const book = await Sach.findOne({ MaSach: borrow.MaSach });

		const now = NgayTraThucTe ? new Date(NgayTraThucTe) : new Date();

		if (MatSach) {
			if (!book) {
				throw new ApiError(
					400,
					"Không tìm thấy sách để tính tiền phạt"
				);
			}

			const lostFine = Math.round(
				(book.DonGia || 0) * LOST_FINE_MULTIPLIER
			);

			borrow.TinhTrang = "Mất sách";
			borrow.NgayTraThucTe = now;
			borrow.TienPhat = lostFine;
			borrow.DaThanhToanTienPhat = false;

			if (reader && lostFine > 0) {
				const hienTai = reader.TienPhatChuaDong || 0;
				reader.TienPhatChuaDong = hienTai + lostFine;

				const lockUntil = new Date(now);
				lockUntil.setDate(lockUntil.getDate() + BAN_DAYS_AFTER_LOST);
				reader.CamMuonDen = lockUntil;

				await reader.save();
			}

			await borrow.save();
			return borrow;
		}

		let fine = 0;
		if (borrow.NgayTra) {
			const diffMs = now - borrow.NgayTra;
			if (diffMs > 0) {
				const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
				fine = diffDays * DAILY_FINE;
			}
		}

		if (book) {
			book.SoQuyen += 1;
			await book.save();
		}

		borrow.TinhTrang = "Đã trả";
		borrow.NgayTraThucTe = now;
		borrow.TienPhat = fine;
		borrow.DaThanhToanTienPhat = fine <= 0;

		if (reader && fine > 0) {
			const hienTai = reader.TienPhatChuaDong || 0;
			reader.TienPhatChuaDong = hienTai + fine;
			await reader.save();
		}

		await borrow.save();
		return borrow;
	}

	async payFine(MaPhieuMuon, soTienThanhToan) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		if (!borrow.TienPhat || borrow.TienPhat <= 0) {
			throw new ApiError(400, "Phiếu mượn không có tiền phạt");
		}

		if (borrow.DaThanhToanTienPhat) {
			throw new ApiError(
				400,
				"Tiền phạt của phiếu mượn đã được thanh toán"
			);
		}

		let amount = Number(soTienThanhToan);
		if (!amount || amount <= 0) {
			amount = borrow.TienPhat;
		}

		if (amount > borrow.TienPhat) {
			amount = borrow.TienPhat;
		}

		const reader = await DocGia.findOne({ MaDocGia: borrow.MaDocGia });

		if (reader) {
			const hienTai = reader.TienPhatChuaDong || 0;
			reader.TienPhatChuaDong = Math.max(hienTai - amount, 0);

			if (reader.TienPhatChuaDong === 0) {
				if (!reader.CamMuonDen || reader.CamMuonDen < new Date()) {
					reader.CamMuonDen = null;
				}
			}

			await reader.save();
		}

		borrow.TienPhat = borrow.TienPhat - amount;
		if (borrow.TienPhat <= 0) {
			borrow.TienPhat = 0;
			borrow.DaThanhToanTienPhat = true;
		}

		await borrow.save();

		return {
			borrow,
			amountPaid: amount,
		};
	}
	async payAllFinesByReader(MaDocGia) {
		const reader = await DocGia.findOne({ MaDocGia });
		if (!reader) {
			throw new ApiError(404, "Không tìm thấy độc giả");
		}

		const borrows = await TheoDoiMuonSach.find({
			MaDocGia,
			TienPhat: { $gt: 0 },
			DaThanhToanTienPhat: false,
		});

		if (!borrows.length) {
			throw new ApiError(
				400,
				"Độc giả không có tiền phạt cần thanh toán"
			);
		}

		const totalFine = borrows.reduce(
			(sum, b) => sum + (b.TienPhat || 0),
			0
		);

		reader.TienPhatChuaDong = 0;
		const now = new Date();
		if (!reader.CamMuonDen || reader.CamMuonDen < now) {
			reader.CamMuonDen = null;
		}
		await reader.save();

		for (const borrow of borrows) {
			borrow.TienPhat = 0;
			borrow.DaThanhToanTienPhat = true;
			await borrow.save();
		}

		return {
			totalFinePaid: totalFine,
			borrowCount: borrows.length,
			reader,
		};
	}
	// Cập nhật phiếu mượn
	async updateBorrow(MaPhieuMuon, borrowData) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		const { NgayMuon, NgayTra, TinhTrang } = borrowData;

		if (NgayMuon) borrow.NgayMuon = NgayMuon;
		if (NgayTra) borrow.NgayTra = NgayTra;
		if (TinhTrang) borrow.TinhTrang = TinhTrang;

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
		const baseMatch = { DaXoa: false };

		const total = await TheoDoiMuonSach.countDocuments(baseMatch);
		const dangMuon = await TheoDoiMuonSach.countDocuments({
			...baseMatch,
			TinhTrang: "Đang mượn",
		});
		const daTra = await TheoDoiMuonSach.countDocuments({
			...baseMatch,
			TinhTrang: "Đã trả",
		});
		const quaHan = await TheoDoiMuonSach.countDocuments({
			...baseMatch,
			TinhTrang: "Quá hạn",
		});
		const matSach = await TheoDoiMuonSach.countDocuments({
			...baseMatch,
			TinhTrang: "Mất sách",
		});

		const agg = await TheoDoiMuonSach.aggregate([
			{
				$match: {
					DaXoa: { $ne: true },
					TienPhat: { $gt: 0 },
					DaThanhToanTienPhat: false,
				},
			},
			{ $group: { _id: null, tong: { $sum: "$TienPhat" } } },
		]);
		const tongTienPhatChuaThu = agg.length ? agg[0].tong : 0;

		return {
			total,
			dangMuon,
			daTra,
			quaHan,
			matSach,
			tongTienPhatChuaThu,
		};
	}
}

module.exports = new BorrowService();
