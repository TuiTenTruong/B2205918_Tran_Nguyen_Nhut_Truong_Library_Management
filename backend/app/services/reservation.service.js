const DatTruocSach = require("../models/reservation.model");
const Sach = require("../models/book.model");
const DocGia = require("../models/reader.model");
const TheoDoiMuonSach = require("../models/borrow.model");
const ApiError = require("../api-error");

// Import notification service (lazy load để tránh circular dependency)
let notificationService = null;
const getNotificationService = () => {
	if (!notificationService) {
		notificationService = require("./notification.service");
	}
	return notificationService;
};

// Import email service (lazy load)
let emailService = null;
const getEmailService = () => {
	if (!emailService) {
		emailService = require("./email.service");
	}
	return emailService;
};

const PICKUP_DEADLINE_HOURS = 48;
const MAX_RESERVATIONS_PER_READER = 3;

class ReservationService {
	async createReservation(MaDocGia, MaSach) {
		const reader = await DocGia.findOne({ MaDocGia, DaXoa: false });
		if (!reader) {
			throw new ApiError(404, "Không tìm thấy độc giả");
		}

		const now = new Date();
		if (reader.CamMuonDen && reader.CamMuonDen > now) {
			throw new ApiError(400, "Bạn đang bị tạm khóa quyền mượn sách");
		}

		if (reader.TienPhatChuaDong > 0) {
			throw new ApiError(400, "Bạn còn tiền phạt chưa thanh toán");
		}

		const book = await Sach.findOne({ MaSach, DaXoa: false });
		if (!book) {
			throw new ApiError(404, "Không tìm thấy sách");
		}

		if (book.SoQuyen > 0) {
			throw new ApiError(400, "Sách vẫn còn, bạn có thể mượn trực tiếp");
		}

		const existingReservation = await DatTruocSach.findOne({
			MaDocGia,
			MaSach,
			TrangThai: { $in: ["Đang chờ", "Sẵn sàng"] },
			DaXoa: false,
		});
		if (existingReservation) {
			throw new ApiError(400, "Bạn đã đặt trước sách này rồi");
		}

		const existingBorrow = await TheoDoiMuonSach.findOne({
			MaDocGia,
			MaSach,
			TinhTrang: { $in: ["Đang mượn", "Quá hạn"] },
		});
		if (existingBorrow) {
			throw new ApiError(400, "Bạn đang mượn sách này");
		}

		const currentReservations = await DatTruocSach.countDocuments({
			MaDocGia,
			TrangThai: { $in: ["Đang chờ", "Sẵn sàng"] },
			DaXoa: false,
		});
		if (currentReservations >= MAX_RESERVATIONS_PER_READER) {
			throw new ApiError(
				400,
				`Bạn chỉ được đặt trước tối đa ${MAX_RESERVATIONS_PER_READER} sách`
			);
		}

		const lastInQueue = await DatTruocSach.findOne({
			MaSach,
			TrangThai: "Đang chờ",
			DaXoa: false,
		}).sort({ ThuTuHangDoi: -1 });

		const thuTuHangDoi = lastInQueue ? lastInQueue.ThuTuHangDoi + 1 : 1;

		// 10. Tạo đặt trước
		const reservation = await DatTruocSach.create({
			MaDocGia,
			MaSach,
			TrangThai: "Đang chờ",
			ThuTuHangDoi: thuTuHangDoi,
		});

		return {
			reservation,
			viTriHangDoi: thuTuHangDoi,
			message: `Đặt trước thành công. Bạn đang ở vị trí ${thuTuHangDoi} trong hàng đợi.`,
		};
	}

	// Xử lý khi có sách được trả (gọi từ borrow.service khi trả sách)
	async processBookReturn(MaSach) {
		// Tìm người đầu tiên trong hàng đợi
		const nextReservation = await DatTruocSach.findOne({
			MaSach,
			TrangThai: "Đang chờ",
			DaXoa: false,
		}).sort({ ThuTuHangDoi: 1 });

		if (!nextReservation) {
			return null; // Không có ai đặt trước
		}

		// Cập nhật trạng thái sẵn sàng
		const now = new Date();
		const hanLaySach = new Date(now);
		hanLaySach.setHours(hanLaySach.getHours() + PICKUP_DEADLINE_HOURS);

		nextReservation.TrangThai = "Sẵn sàng";
		nextReservation.NgaySanSang = now;
		nextReservation.HanLaySach = hanLaySach;
		await nextReservation.save();

		// Giảm số lượng sách (giữ cho người đặt)
		const book = await Sach.findOne({ MaSach });
		if (book && book.SoQuyen > 0) {
			book.SoQuyen -= 1;
			await book.save();
		}

		// Gửi thông báo cho độc giả
		try {
			const notifService = getNotificationService();
			const bookTitle = book ? book.TenSach : "Sách không xác định";
			const hanLaySachFormatted = hanLaySach.toLocaleString("vi-VN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});

			await notifService.createNotification({
				LoaiNguoiNhan: "user",
				MaNguoiNhan: nextReservation.MaDocGia,
				LoaiThongBao: "dat_truoc_san_sang",
				TieuDe: "Sách đặt trước đã sẵn sàng",
				NoiDung: `Sách "${bookTitle}" bạn đặt trước đã sẵn sàng. Vui lòng đến thư viện lấy sách trước ${hanLaySachFormatted} (trong vòng 48 giờ).`,
				MaSach: MaSach,
				MaPhieuMuon: null,
			});
		} catch (err) {
			console.error(
				"Error creating reservation ready notification:",
				err.message
			);
		}

		// Gửi email thông báo sách sẵn sàng
		try {
			const reader = await DocGia.findOne({
				MaDocGia: nextReservation.MaDocGia,
			});
			if (reader && reader.Email) {
				const emailSvc = getEmailService();
				const readerName = `${reader.HoLot || ""} ${
					reader.Ten || ""
				}`.trim();
				const bookTitle = book ? book.TenSach : "Sách không xác định";

				await emailSvc.sendBookAvailableNotification(
					reader.Email,
					readerName,
					bookTitle,
					hanLaySach
				);
			}
		} catch (err) {
			console.error("Error sending book available email:", err.message);
		}

		return {
			reservation: nextReservation,
			hanLaySach,
		};
	}

	// Hoàn tất đặt trước (khi user đến mượn) - Tự động tạo TheoDoiMuonSach
	async completeReservation(
		MaDatTruoc,
		MaDocGia = null,
		NgayTraCustom = null
	) {
		const reservation = await DatTruocSach.findOne({
			MaDatTruoc,
			DaXoa: false,
		});

		if (!reservation) {
			throw new ApiError(404, "Không tìm thấy đơn đặt trước");
		}

		// Kiểm tra quyền sở hữu
		if (MaDocGia && reservation.MaDocGia !== MaDocGia) {
			throw new ApiError(403, "Bạn không có quyền với đơn đặt trước này");
		}

		if (reservation.TrangThai !== "Sẵn sàng") {
			throw new ApiError(400, "Sách chưa sẵn sàng để mượn");
		}

		// Kiểm tra hết hạn lấy sách
		const now = new Date();
		if (reservation.HanLaySach && now > reservation.HanLaySach) {
			throw new ApiError(
				400,
				"Đã hết hạn lấy sách, đơn đặt trước đã bị hủy"
			);
		}

		// Kiểm tra độc giả
		const reader = await DocGia.findOne({
			MaDocGia: reservation.MaDocGia,
			DaXoa: false,
		});
		if (!reader) {
			throw new ApiError(404, "Không tìm thấy độc giả");
		}

		// Kiểm tra độc giả có bị cấm mượn không
		if (reader.CamMuonDen && reader.CamMuonDen > now) {
			throw new ApiError(400, "Độc giả đang bị tạm khóa quyền mượn sách");
		}

		// Kiểm tra tiền phạt
		if (reader.TienPhatChuaDong > 0) {
			throw new ApiError(400, "Độc giả còn tiền phạt chưa thanh toán");
		}

		// Tạo ngày mượn và ngày trả
		const ngayMuon = now;
		let ngayTra;
		if (NgayTraCustom) {
			ngayTra = new Date(NgayTraCustom);
			// Validate ngày trả không quá 14 ngày
			const maxDate = new Date(now);
			maxDate.setDate(maxDate.getDate() + 14);
			if (ngayTra > maxDate) {
				throw new ApiError(
					400,
					"Ngày trả không được quá 14 ngày kể từ hôm nay"
				);
			}
			if (ngayTra < now) {
				throw new ApiError(
					400,
					"Ngày trả không được trước ngày hôm nay"
				);
			}
		} else {
			ngayTra = new Date(now);
			ngayTra.setDate(ngayTra.getDate() + 14);
		}

		// Tạo phiếu mượn sách (TheoDoiMuonSach)
		const newBorrow = await TheoDoiMuonSach.create({
			MaDocGia: reservation.MaDocGia,
			MaSach: reservation.MaSach,
			NgayMuon: ngayMuon,
			NgayTra: ngayTra,
			NgayTraThucTe: null,
			TinhTrang: "Đang mượn",
			TienPhat: 0,
			DaThanhToanTienPhat: false,
		});

		// Cập nhật mảng Muon của độc giả
		reader.Muon.push({
			MASACH: reservation.MaSach,
			NGAYMUON: ngayMuon,
			NGAYTRA: ngayTra,
			TRANGTHAI: "Đang mượn",
		});
		await reader.save();

		// Cập nhật trạng thái đặt trước
		reservation.TrangThai = "Đã mượn";
		await reservation.save();

		return {
			reservation,
			borrow: newBorrow,
		};
	}

	// Hủy đặt trước
	async cancelReservation(MaDatTruoc, MaDocGia = null) {
		const reservation = await DatTruocSach.findOne({
			MaDatTruoc,
			DaXoa: false,
		});

		if (!reservation) {
			throw new ApiError(404, "Không tìm thấy đơn đặt trước");
		}

		// Kiểm tra quyền sở hữu
		if (MaDocGia && reservation.MaDocGia !== MaDocGia) {
			throw new ApiError(403, "Bạn không có quyền hủy đơn đặt trước này");
		}

		if (!["Đang chờ", "Sẵn sàng"].includes(reservation.TrangThai)) {
			throw new ApiError(400, "Không thể hủy đơn đặt trước này");
		}

		const oldStatus = reservation.TrangThai;
		const MaSach = reservation.MaSach;

		// Cập nhật trạng thái
		reservation.TrangThai = "Đã hủy";
		await reservation.save();

		// Nếu đang ở trạng thái "Sẵn sàng", hoàn lại sách và thông báo người tiếp theo
		if (oldStatus === "Sẵn sàng") {
			const book = await Sach.findOne({ MaSach });
			if (book) {
				book.SoQuyen += 1;
				await book.save();
			}

			// Xử lý cho người tiếp theo trong hàng đợi
			await this.processBookReturn(MaSach);
		}

		// Cập nhật lại thứ tự hàng đợi
		await this.updateQueueOrder(MaSach);

		return { message: "Hủy đặt trước thành công" };
	}

	// Cập nhật thứ tự hàng đợi
	async updateQueueOrder(MaSach) {
		const reservations = await DatTruocSach.find({
			MaSach,
			TrangThai: "Đang chờ",
			DaXoa: false,
		}).sort({ NgayDat: 1 });

		for (let i = 0; i < reservations.length; i++) {
			reservations[i].ThuTuHangDoi = i + 1;
			await reservations[i].save();
		}
	}

	// Kiểm tra và xử lý các đơn đặt trước hết hạn
	async processExpiredReservations() {
		const now = new Date();

		const expiredReservations = await DatTruocSach.find({
			TrangThai: "Sẵn sàng",
			HanLaySach: { $lt: now },
			DaXoa: false,
		});

		const results = [];

		for (const reservation of expiredReservations) {
			reservation.TrangThai = "Hết hạn";
			await reservation.save();

			// Hoàn lại sách vào kho
			const book = await Sach.findOne({ MaSach: reservation.MaSach });
			if (book) {
				book.SoQuyen += 1;
				await book.save();

				// Xử lý cho người tiếp theo
				await this.processBookReturn(reservation.MaSach);
			}

			results.push(reservation);
		}

		return {
			expiredCount: results.length,
			reservations: results,
		};
	}

	// Lấy danh sách đặt trước của độc giả
	async getReservationsByReader(MaDocGia) {
		const reservations = await DatTruocSach.find({
			MaDocGia,
			DaXoa: false,
		})
			.sort({ NgayDat: -1 })
			.lean();

		// Lấy thông tin sách
		const bookIds = [...new Set(reservations.map((r) => r.MaSach))];
		const books = await Sach.find({ MaSach: { $in: bookIds } }).lean();
		const bookMap = {};
		for (const b of books) {
			bookMap[b.MaSach] = b;
		}

		return reservations.map((r) => ({
			...r,
			book: bookMap[r.MaSach] || null,
		}));
	}

	// Lấy hàng đợi của một cuốn sách
	async getQueueByBook(MaSach) {
		const reservations = await DatTruocSach.find({
			MaSach,
			TrangThai: { $in: ["Đang chờ", "Sẵn sàng"] },
			DaXoa: false,
		})
			.sort({ ThuTuHangDoi: 1 })
			.lean();

		// Lấy thông tin độc giả
		const readerIds = [...new Set(reservations.map((r) => r.MaDocGia))];
		const readers = await DocGia.find({
			MaDocGia: { $in: readerIds },
		}).lean();
		const readerMap = {};
		for (const r of readers) {
			readerMap[r.MaDocGia] = `${r.HoLot || ""} ${r.Ten || ""}`.trim();
		}

		return reservations.map((r) => ({
			...r,
			readerName: readerMap[r.MaDocGia] || "Unknown",
		}));
	}

	// Lấy tất cả đặt trước (Admin)
	async getAllReservations(filters = {}) {
		const query = { DaXoa: false };

		if (filters.TrangThai) {
			query.TrangThai = filters.TrangThai;
		}
		if (filters.MaSach) {
			query.MaSach = filters.MaSach;
		}

		const reservations = await DatTruocSach.find(query)
			.sort({ NgayDat: -1 })
			.lean();

		// Lấy thông tin sách và độc giả
		const bookIds = [...new Set(reservations.map((r) => r.MaSach))];
		const readerIds = [...new Set(reservations.map((r) => r.MaDocGia))];

		const [books, readers] = await Promise.all([
			Sach.find({ MaSach: { $in: bookIds } }).lean(),
			DocGia.find({ MaDocGia: { $in: readerIds } }).lean(),
		]);

		const bookMap = {};
		for (const b of books) {
			bookMap[b.MaSach] = b.TenSach;
		}

		const readerMap = {};
		for (const r of readers) {
			readerMap[r.MaDocGia] = `${r.HoLot || ""} ${r.Ten || ""}`.trim();
		}

		return reservations.map((r) => ({
			...r,
			bookTitle: bookMap[r.MaSach] || "Unknown",
			readerName: readerMap[r.MaDocGia] || "Unknown",
		}));
	}

	// Kiểm tra vị trí trong hàng đợi
	async getQueuePosition(MaDocGia, MaSach) {
		const reservation = await DatTruocSach.findOne({
			MaDocGia,
			MaSach,
			TrangThai: { $in: ["Đang chờ", "Sẵn sàng"] },
			DaXoa: false,
		});

		if (!reservation) {
			return null;
		}

		return {
			reservation,
			position: reservation.ThuTuHangDoi,
			status: reservation.TrangThai,
			hanLaySach: reservation.HanLaySach,
		};
	}

	// Lấy chi tiết đặt trước
	async getReservationById(MaDatTruoc) {
		const reservation = await DatTruocSach.findOne({
			MaDatTruoc,
			DaXoa: false,
		}).lean();

		if (!reservation) {
			throw new ApiError(404, "Không tìm thấy đơn đặt trước");
		}

		// Lấy thông tin sách
		const book = await Sach.findOne({ MaSach: reservation.MaSach }).lean();

		return {
			...reservation,
			book: book || null,
		};
	}

	// Thống kê đặt trước
	async getReservationStatistics() {
		const [dangCho, sanSang, daMuon, daTra, hetHan, daHuy] =
			await Promise.all([
				DatTruocSach.countDocuments({
					TrangThai: "Đang chờ",
					DaXoa: false,
				}),
				DatTruocSach.countDocuments({
					TrangThai: "Sẵn sàng",
					DaXoa: false,
				}),
				DatTruocSach.countDocuments({
					TrangThai: "Đã mượn",
					DaXoa: false,
				}),
				DatTruocSach.countDocuments({
					TrangThai: "Đã trả",
					DaXoa: false,
				}),
				DatTruocSach.countDocuments({
					TrangThai: "Hết hạn",
					DaXoa: false,
				}),
				DatTruocSach.countDocuments({
					TrangThai: "Đã hủy",
					DaXoa: false,
				}),
			]);

		return {
			dangCho,
			sanSang,
			daMuon,
			daTra,
			hetHan,
			daHuy,
			total: dangCho + sanSang + daMuon + daTra + hetHan + daHuy,
		};
	}
}

module.exports = new ReservationService();
