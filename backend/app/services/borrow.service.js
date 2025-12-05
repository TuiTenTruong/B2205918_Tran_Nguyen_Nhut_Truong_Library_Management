const TheoDoiMuonSach = require("../models/borrow.model");
const Sach = require("../models/book.model");
const DocGia = require("../models/reader.model");
const DatTruocSach = require("../models/reservation.model");
const ApiError = require("../api-error");

let reservationService = null;
const getReservationService = () => {
	if (!reservationService) {
		reservationService = require("./reservation.service");
	}
	return reservationService;
};

let notificationService = null;
const getNotificationService = () => {
	if (!notificationService) {
		notificationService = require("./notification.service");
	}
	return notificationService;
};

let emailService = null;
const getEmailService = () => {
	if (!emailService) {
		emailService = require("./email.service");
	}
	return emailService;
};

const MAX_BORROWED_BOOKS = 5;
const BORROW_DURATION_DAYS = 14;
const DAILY_FINE = 2000;
const LOST_FINE_MULTIPLIER = 1.5;
const BAN_DAYS_AFTER_LOST = 30;
const MAX_RENEWALS_PER_MONTH = 3;
const RENEWAL_DAYS = 7;

class BorrowService {
	async createBorrow(borrowData, fromReservation = false) {
		const { MaDocGia, MaSach, NgayMuon, NgayTra } = borrowData;

		const reader = await DocGia.findOne({ MaDocGia, DaXoa: false });
		if (!reader) {
			throw new ApiError(404, "Không tìm thấy độc giả");
		}

		const now = new Date();

		const tienPhatChuaDong = reader.TienPhatChuaDong || 0;
		if (tienPhatChuaDong > 0) {
			throw new ApiError(
				400,
				`Độc giả còn ${tienPhatChuaDong.toLocaleString(
					"vi-VN"
				)}đ tiền phạt chưa thanh toán. Vui lòng thanh toán để được mượn sách.`
			);
		}

		if (reader.CamMuonDen && new Date(reader.CamMuonDen) > now) {
			const ngayMoKhoa = new Date(reader.CamMuonDen).toLocaleDateString(
				"vi-VN"
			);
			throw new ApiError(
				403,
				`Tài khoản đang bị khóa quyền mượn sách đến ${ngayMoKhoa}. Vui lòng liên hệ thủ thư để biết thêm chi tiết.`
			);
		}

		const hasOverdue = await TheoDoiMuonSach.exists({
			MaDocGia,
			TinhTrang: "Quá hạn",
			DaXoa: { $ne: true },
		});
		if (hasOverdue) {
			throw new ApiError(
				400,
				"Bạn còn sách quá hạn chưa trả. Vui lòng trả sách quá hạn trước khi mượn sách mới."
			);
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

		if (!fromReservation && book.SoQuyen <= 0) {
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

		if (!fromReservation) {
			book.SoQuyen -= 1;
			await book.save();
		}

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
		await this.updateOverdueStatus();

		const query = {};

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

		const readerIds = [...new Set(borrows.map((b) => b.MaDocGia))];
		const bookIds = [...new Set(borrows.map((b) => b.MaSach))];

		const [readers, books] = await Promise.all([
			DocGia.find({ MaDocGia: { $in: readerIds } }).lean(),
			Sach.find({ MaSach: { $in: bookIds } }).lean(),
		]);

		const readerMap = {};
		for (const r of readers) {
			const hoLot = r.HoLot || "";
			const ten = r.Ten || "";
			readerMap[r.MaDocGia] = `${hoLot} ${ten}`.trim() || "Unknown";
		}

		const bookMap = {};
		for (const b of books) {
			bookMap[b.MaSach] = b.TenSach || "Unknown";
		}

		return borrows.map((b) => ({
			...b,
			readerName: readerMap[b.MaDocGia] || "Unknown",
			bookTitle: bookMap[b.MaSach] || "Unknown",
		}));
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

		// XỬ LÝ MẤT SÁCH THỦ CÔNG
		if (MatSach) {
			console.log(
				`[Manual Lost Book] Starting process for MaPhieuMuon: ${MaPhieuMuon}`
			);

			if (!book) {
				throw new ApiError(
					404,
					"Không tìm thấy sách để tính tiền phạt"
				);
			}

			// Tính tiền phạt mất sách = 1.5 lần giá sách
			const lostFine = Math.round(
				(book.DonGia || 0) * LOST_FINE_MULTIPLIER
			);
			console.log(`[Manual Lost Book] Calculated fine: ${lostFine}`);

			// Cập nhật phiếu mượn
			borrow.TinhTrang = "Mất sách";
			borrow.NgayTraThucTe = now;
			borrow.TienPhat = lostFine;
			borrow.DaThanhToanTienPhat = false;
			await borrow.save();

			if (!reader) {
				console.log(
					`[Manual Lost Book] Reader not found for MaDocGia: ${borrow.MaDocGia}`
				);
				return borrow;
			}

			console.log(`[Manual Lost Book] Reader found: ${reader.MaDocGia}`);

			// Cộng tiền phạt vào TienPhatChuaDong
			const hienTai = reader.TienPhatChuaDong || 0;
			reader.TienPhatChuaDong = hienTai + lostFine;
			console.log(
				`[Manual Lost Book] Updated TienPhatChuaDong: ${reader.TienPhatChuaDong}`
			);

			// LUÔN KHÓA QUYỀN MƯỢN 30 NGÀY KHI MẤT SÁCH
			const lockUntil = new Date(now);
			lockUntil.setDate(lockUntil.getDate() + BAN_DAYS_AFTER_LOST);
			reader.CamMuonDen = lockUntil;
			reader.markModified("CamMuonDen");
			console.log(
				`[Manual Lost Book] Set CamMuonDen to: ${lockUntil.toISOString()}`
			);

			// Cập nhật trạng thái trong mảng Muon
			const muonIndex = reader.Muon.findIndex(
				(m) =>
					m.MASACH === borrow.MaSach &&
					m.TRANGTHAI !== "Đã trả" &&
					m.TRANGTHAI !== "Mất sách"
			);
			if (muonIndex !== -1) {
				reader.Muon[muonIndex].TRANGTHAI = "Mất sách";
				reader.Muon[muonIndex].NGAYTRA = now;
				console.log(
					`[Manual Lost Book] Updated Muon array at index ${muonIndex}`
				);
			}

			try {
				await reader.save();
				console.log(
					`[Manual Lost Book] Successfully saved reader ${reader.MaDocGia}`
				);
				console.log(
					`[Manual Lost Book] Final state - CamMuonDen: ${reader.CamMuonDen}, TienPhatChuaDong: ${reader.TienPhatChuaDong}`
				);
			} catch (saveError) {
				console.error(
					`[Manual Lost Book] Error saving reader:`,
					saveError
				);
				throw new ApiError(
					500,
					`Lỗi khi lưu thông tin độc giả: ${saveError.message}`
				);
			}

			// Gửi email thông báo khóa tài khoản
			try {
				if (reader && reader.Email) {
					const emailSvc = getEmailService();
					const readerName = `${reader.HoLot || ""} ${
						reader.Ten || ""
					}`.trim();
					const bookTitle = book
						? book.TenSach
						: "Sách không xác định";

					await emailSvc.sendAccountBannedNotification(
						reader.Email,
						readerName,
						bookTitle,
						lockUntil,
						lostFine
					);
				}
			} catch (err) {
				console.error(
					"Error sending account banned email:",
					err.message
				);
			}

			console.log(
				`[Manual Lost Book] Completed - Reader ${
					borrow.MaDocGia
				} locked until ${lockUntil.toLocaleDateString(
					"vi-VN"
				)}, Fine: ${lostFine.toLocaleString("vi-VN")}đ`
			);
			return borrow;
		}

		let fine = 0;
		if (borrow.NgayTra) {
			const dueDate = new Date(borrow.NgayTra);
			const diffMs = now - dueDate;
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

		if (reader) {
			if (fine > 0) {
				const hienTai = reader.TienPhatChuaDong || 0;
				reader.TienPhatChuaDong = hienTai + fine;
			}

			const muonIndex = reader.Muon.findIndex(
				(m) =>
					m.MASACH === borrow.MaSach &&
					m.TRANGTHAI !== "Đã trả" &&
					m.TRANGTHAI !== "Mất sách"
			);
			if (muonIndex !== -1) {
				reader.Muon[muonIndex].TRANGTHAI = "Đã trả";
				reader.Muon[muonIndex].NGAYTRA = now;
			}

			await reader.save();
		}

		await borrow.save();

		try {
			const relatedReservation = await DatTruocSach.findOne({
				MaDocGia: borrow.MaDocGia,
				MaSach: borrow.MaSach,
				TrangThai: "Đã mượn",
				DaXoa: false,
			});

			if (relatedReservation) {
				relatedReservation.TrangThai = "Đã trả";
				await relatedReservation.save();
			}
		} catch (err) {
			console.error("Error updating reservation status:", err.message);
		}

		// Xử lý hàng đợi đặt trước sách
		try {
			const resService = getReservationService();
			await resService.processBookReturn(borrow.MaSach);
		} catch (err) {
			console.error("Error processing reservation queue:", err.message);
		}

		return borrow;
	}

	async payFine(MaPhieuMuon, soTienThanhToan) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		let tienPhat = borrow.TienPhat || 0;
		if (tienPhat <= 0 && borrow.TinhTrang === "Quá hạn") {
			const ngayTra = new Date(borrow.NgayTra);
			const now = new Date();
			if (now > ngayTra) {
				const diffMs = now - ngayTra;
				const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
				tienPhat = diffDays * DAILY_FINE;
				borrow.TienPhat = tienPhat;
			}
		}

		if (tienPhat <= 0) {
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
			amount = tienPhat;
		}

		if (amount > tienPhat) {
			amount = tienPhat;
		}

		const reader = await DocGia.findOne({ MaDocGia: borrow.MaDocGia });

		if (reader) {
			const hienTai = reader.TienPhatChuaDong || 0;
			reader.TienPhatChuaDong = Math.max(hienTai - amount, 0);

			// CHỈ MỞ KHÓA KHI: Đã trả hết tiền phạt VÀ (không có CamMuonDen HOẶC đã hết hạn)
			const now = new Date();
			if (reader.TienPhatChuaDong === 0) {
				if (!reader.CamMuonDen || new Date(reader.CamMuonDen) <= now) {
					console.log(
						`[Pay Fine] Unlocking reader ${reader.MaDocGia} - all fines paid and ban expired`
					);
					reader.CamMuonDen = null;
					reader.markModified("CamMuonDen");
				} else {
					console.log(
						`[Pay Fine] Reader ${reader.MaDocGia} still banned until ${reader.CamMuonDen}`
					);
				}
			}

			await reader.save();
		}

		borrow.TienPhat = tienPhat - amount;
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

		// CHỈ MỞ KHÓA KHI: Đã trả hết tiền phạt VÀ (không có CamMuonDen HOẶC đã hết hạn)
		const now = new Date();
		if (!reader.CamMuonDen || new Date(reader.CamMuonDen) <= now) {
			console.log(
				`[Pay All Fines] Unlocking reader ${reader.MaDocGia} - all fines paid and ban expired`
			);
			reader.CamMuonDen = null;
			reader.markModified("CamMuonDen");
		} else {
			console.log(
				`[Pay All Fines] Reader ${reader.MaDocGia} still banned until ${reader.CamMuonDen}`
			);
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

	// Lấy danh sách phiếu mượn quá hạn
	async getOverdueBorrows() {
		await this.updateOverdueStatus();

		const borrows = await TheoDoiMuonSach.find({
			TinhTrang: "Quá hạn",
			DaXoa: { $ne: true },
		})
			.sort({ NgayTra: 1 })
			.lean();
		const readerIds = [...new Set(borrows.map((b) => b.MaDocGia))];
		const bookIds = [...new Set(borrows.map((b) => b.MaSach))];

		const [readers, books] = await Promise.all([
			DocGia.find({ MaDocGia: { $in: readerIds } }).lean(),
			Sach.find({ MaSach: { $in: bookIds } }).lean(),
		]);

		const readerMap = {};
		for (const r of readers) {
			const hoLot = r.HoLot || "";
			const ten = r.Ten || "";
			readerMap[r.MaDocGia] = `${hoLot} ${ten}`.trim() || "Unknown";
		}

		const bookMap = {};
		for (const b of books) {
			bookMap[b.MaSach] = b.TenSach || "Unknown";
		}

		return borrows.map((b) => ({
			...b,
			readerName: readerMap[b.MaDocGia] || "Unknown",
			bookTitle: bookMap[b.MaSach] || "Unknown",
		}));
	}

	// Thống kê mượn sách
	async getBorrowStatistics() {
		await this.updateOverdueStatus();

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

	async unlockExpiredBans() {
		const now = new Date();

		const readers = await DocGia.find({
			CamMuonDen: { $ne: null, $lte: now },
			TienPhatChuaDong: { $lte: 0 },
			DaXoa: false,
		});

		let unlockedCount = 0;

		for (const reader of readers) {
			console.log(
				`[Auto Unlock] Unlocking reader ${reader.MaDocGia} - Ban expired: ${reader.CamMuonDen}, Fine paid: ${reader.TienPhatChuaDong}`
			);
			reader.CamMuonDen = null;
			reader.markModified("CamMuonDen");
			await reader.save();
			unlockedCount++;
		}

		if (unlockedCount > 0) {
			console.log(
				`[Auto Unlock] Successfully unlocked ${unlockedCount} reader(s)`
			);
		}

		return { unlockedCount };
	}

	async updateOverdueStatus() {
		const now = new Date();
		await this.unlockExpiredBans();

		// Tìm các phiếu mượn đang mượn mà ngày trả < ngày hiện tại
		const overdueBorrows = await TheoDoiMuonSach.find({
			TinhTrang: "Đang mượn",
			NgayTra: { $lt: now },
			DaXoa: { $ne: true },
		});

		let updatedCount = 0;

		for (const borrow of overdueBorrows) {
			borrow.TinhTrang = "Quá hạn";
			await borrow.save();

			const reader = await DocGia.findOne({ MaDocGia: borrow.MaDocGia });
			if (reader) {
				const muonIndex = reader.Muon.findIndex(
					(m) =>
						m.MASACH === borrow.MaSach &&
						m.TRANGTHAI === "Đang mượn"
				);
				if (muonIndex !== -1) {
					reader.Muon[muonIndex].TRANGTHAI = "Quá hạn";
					await reader.save();
				}
			}

			updatedCount++;
		}

		// Tự động chuyển sang "Mất sách" nếu quá hạn >= 30 ngày
		const thirtyDaysAgo = new Date(now);
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const lostBorrows = await TheoDoiMuonSach.find({
			TinhTrang: "Quá hạn",
			NgayTra: { $lte: thirtyDaysAgo },
			DaXoa: { $ne: true },
		});

		let lostCount = 0;

		for (const borrow of lostBorrows) {
			// Lấy thông tin sách để tính tiền phạt mất sách
			const book = await Sach.findOne({ MaSach: borrow.MaSach });
			if (!book) continue;

			// Tính tiền phạt mất sách = 1.5 lần giá sách
			const lostFine = Math.round(
				(book.DonGia || 0) * LOST_FINE_MULTIPLIER
			);

			// Cập nhật phiếu mượn
			borrow.TinhTrang = "Mất sách";
			borrow.NgayTraThucTe = now;
			borrow.TienPhat = lostFine;
			borrow.DaThanhToanTienPhat = false;
			await borrow.save();

			const reader = await DocGia.findOne({ MaDocGia: borrow.MaDocGia });
			if (reader) {
				// Cộng tiền phạt vào TienPhatChuaDong
				const hienTai = reader.TienPhatChuaDong || 0;
				reader.TienPhatChuaDong = hienTai + lostFine;

				// LUÔN KHÓA QUYỀN MƯỢN 30 NGÀY KHI TỰ ĐỘNG CHUYỂN SANG MẤT SÁCH
				const lockUntil = new Date(now);
				lockUntil.setDate(lockUntil.getDate() + BAN_DAYS_AFTER_LOST);
				reader.CamMuonDen = lockUntil;
				reader.markModified("CamMuonDen");

				// Cập nhật trạng thái trong mảng Muon
				const muonIndex = reader.Muon.findIndex(
					(m) =>
						m.MASACH === borrow.MaSach && m.TRANGTHAI === "Quá hạn"
				);
				if (muonIndex !== -1) {
					reader.Muon[muonIndex].TRANGTHAI = "Mất sách";
					reader.Muon[muonIndex].NGAYTRA = now;
				}

				await reader.save();
				console.log(
					`[Auto Lost Book] Locked reader ${
						reader.MaDocGia
					} until ${reader.CamMuonDen.toISOString()}, Fine: ${lostFine.toLocaleString(
						"vi-VN"
					)}đ, TienPhatChuaDong: ${reader.TienPhatChuaDong}`
				);

				// Gửi thông báo cho độc giả và admin
				try {
					const notifService = getNotificationService();
					const readerName =
						`${reader.HoLot || ""} ${reader.Ten || ""}`.trim() ||
						"Độc giả";

					// Thông báo cho user
					await notifService.createNotification({
						LoaiNguoiNhan: "user",
						MaNguoiNhan: borrow.MaDocGia,
						LoaiThongBao: "mat_sach",
						TieuDe: "Sách đã được đánh dấu là mất",
						NoiDung: `Sách "${
							book.TenSach || "Không xác định"
						}" đã quá hạn 30 ngày và được hệ thống tự động đánh dấu là mất sách. Tiền phạt: ${lostFine.toLocaleString(
							"vi-VN"
						)}đ. Tài khoản của bạn đã bị khóa quyền mượn thêm 30 ngày.`,
						MaPhieuMuon: borrow.MaPhieuMuon,
						MaSach: borrow.MaSach,
					});

					// Thông báo cho admin
					await notifService.createNotification({
						LoaiNguoiNhan: "admin",
						MaNguoiNhan: borrow.MaDocGia,
						LoaiThongBao: "mat_sach",
						TieuDe: "Hệ thống đã tự động đánh dấu sách mất",
						NoiDung: `Độc giả "${readerName}" (${
							borrow.MaDocGia
						}) đã mượn sách "${
							book.TenSach || "Không xác định"
						}" quá hạn 30 ngày. Hệ thống đã tự động đánh dấu là mất sách và áp dụng tiền phạt ${lostFine.toLocaleString(
							"vi-VN"
						)}đ.`,
						MaPhieuMuon: borrow.MaPhieuMuon,
						MaSach: borrow.MaSach,
					});

					// Gửi email thông báo khóa tài khoản
					if (reader.Email) {
						const emailSvc = getEmailService();
						await emailSvc.sendAccountBannedNotification(
							reader.Email,
							readerName,
							book.TenSach || "Sách không xác định",
							lockUntil,
							lostFine
						);
					}
				} catch (err) {
					console.error(
						"Error creating lost book notification:",
						err.message
					);
				}
			}

			lostCount++;
		}

		return {
			updatedCount,
			lostCount,
		};
	} // Gia hạn sách
	async renewBorrow(MaPhieuMuon, MaDocGia = null) {
		const borrow = await TheoDoiMuonSach.findOne({ MaPhieuMuon });
		if (!borrow) {
			throw new ApiError(404, "Không tìm thấy phiếu mượn");
		}

		// Kiểm tra quyền sở hữu nếu có MaDocGia (user tự gia hạn)
		if (MaDocGia && borrow.MaDocGia !== MaDocGia) {
			throw new ApiError(
				403,
				"Bạn không có quyền gia hạn phiếu mượn này"
			);
		}

		// Kiểm tra trạng thái phiếu mượn
		if (borrow.TinhTrang !== "Đang mượn") {
			throw new ApiError(400, "Chỉ có thể gia hạn sách đang mượn");
		}

		// Kiểm tra số lần gia hạn trong tháng hiện tại
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
			23,
			59,
			59,
			999
		);

		// Đếm số lần gia hạn trong tháng của độc giả này
		const renewalsThisMonth = await TheoDoiMuonSach.aggregate([
			{
				$match: {
					MaDocGia: borrow.MaDocGia,
					SoLanGiaHan: { $gt: 0 },
					updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
				},
			},
			{
				$group: {
					_id: null,
					totalRenewals: { $sum: "$SoLanGiaHan" },
				},
			},
		]);

		const totalRenewalsThisMonth =
			renewalsThisMonth.length > 0
				? renewalsThisMonth[0].totalRenewals
				: 0;

		if (totalRenewalsThisMonth >= MAX_RENEWALS_PER_MONTH) {
			throw new ApiError(
				400,
				`Bạn đã đạt giới hạn gia hạn trong tháng (${MAX_RENEWALS_PER_MONTH} lần)`
			);
		}

		// Kiểm tra ngày trả phải còn hạn hoặc chưa quá hạn quá lâu
		const ngayTra = new Date(borrow.NgayTra);
		const diffMs = now - ngayTra;
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

		// Nếu đã quá hạn hơn 1 ngày thì không cho gia hạn
		if (diffDays > 1) {
			throw new ApiError(
				400,
				"Sách đã quá hạn, không thể gia hạn. Vui lòng trả sách."
			);
		}

		// Kiểm tra độc giả có tiền phạt chưa thanh toán không
		const reader = await DocGia.findOne({ MaDocGia: borrow.MaDocGia });
		if (reader && reader.TienPhatChuaDong > 0) {
			throw new ApiError(
				400,
				"Bạn còn tiền phạt chưa thanh toán, không thể gia hạn"
			);
		}

		// Tính ngày trả mới
		const ngayTraMoi = new Date(ngayTra);
		ngayTraMoi.setDate(ngayTraMoi.getDate() + RENEWAL_DAYS);

		// Cập nhật phiếu mượn
		const soLanGiaHan = borrow.SoLanGiaHan || 0;
		borrow.NgayTra = ngayTraMoi;
		borrow.SoLanGiaHan = soLanGiaHan + 1;
		await borrow.save();

		// Cập nhật trong mảng Muon của reader
		if (reader) {
			const muonIndex = reader.Muon.findIndex(
				(m) => m.MASACH === borrow.MaSach && m.TRANGTHAI === "Đang mượn"
			);
			if (muonIndex !== -1) {
				reader.Muon[muonIndex].NGAYTRA = ngayTraMoi;
				await reader.save();
			}
		}

		return {
			borrow,
			soLanGiaHanTrongThang: totalRenewalsThisMonth + 1,
			soLanGiaHanConLaiTrongThang:
				MAX_RENEWALS_PER_MONTH - totalRenewalsThisMonth - 1,
			ngayTraMoi,
		};
	}
}

module.exports = new BorrowService();
