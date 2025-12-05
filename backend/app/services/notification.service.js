const ThongBao = require("../models/notification.model");
const TheoDoiMuonSach = require("../models/borrow.model");
const DocGia = require("../models/reader.model");
const Sach = require("../models/book.model");
const ApiError = require("../api-error");

// Số ngày trước hạn để thông báo sắp hết hạn
const DAYS_BEFORE_DUE = 3;
// Số ngày quá hạn để đánh dấu mất sách
const DAYS_OVERDUE_FOR_LOST = 30;
// Tiền phạt mỗi ngày
const DAILY_FINE = 2000;

class NotificationService {
	// Tạo thông báo mới
	async createNotification(data) {
		const notification = await ThongBao.create(data);
		return notification;
	}

	// Lấy thông báo của user (độc giả)
	async getNotificationsByUser(MaDocGia, includeRead = false) {
		const query = {
			MaNguoiNhan: MaDocGia,
			LoaiNguoiNhan: "user",
			DaXoa: false,
		};

		if (!includeRead) {
			query.DaDoc = false;
		}

		const notifications = await ThongBao.find(query)
			.sort({ createdAt: -1 })
			.lean();

		return notifications;
	}

	// Lấy thông báo của admin
	async getNotificationsForAdmin(includeRead = false) {
		const query = {
			LoaiNguoiNhan: "admin",
			DaXoa: false,
		};

		if (!includeRead) {
			query.DaDoc = false;
		}

		const notifications = await ThongBao.find(query)
			.sort({ createdAt: -1 })
			.lean();

		// Lấy thông tin độc giả và sách
		const readerIds = [
			...new Set(notifications.map((n) => n.MaNguoiNhan).filter(Boolean)),
		];
		const bookIds = [
			...new Set(notifications.map((n) => n.MaSach).filter(Boolean)),
		];

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

		return notifications.map((n) => ({
			...n,
			readerName: readerMap[n.MaNguoiNhan] || null,
			bookTitle: bookMap[n.MaSach] || null,
		}));
	}

	// Đếm số thông báo chưa đọc
	async getUnreadCount(MaNguoiNhan, LoaiNguoiNhan) {
		const count = await ThongBao.countDocuments({
			MaNguoiNhan,
			LoaiNguoiNhan,
			DaDoc: false,
			DaXoa: false,
		});
		return count;
	}

	// Đếm số thông báo chưa đọc cho admin (tất cả admin)
	async getUnreadCountForAdmin() {
		const count = await ThongBao.countDocuments({
			LoaiNguoiNhan: "admin",
			DaDoc: false,
			DaXoa: false,
		});
		return count;
	}

	// Đánh dấu đã đọc
	async markAsRead(MaThongBao, MaNguoiNhan = null) {
		const query = { MaThongBao };
		if (MaNguoiNhan) {
			query.MaNguoiNhan = MaNguoiNhan;
		}

		const notification = await ThongBao.findOne(query);
		if (!notification) {
			throw new ApiError(404, "Không tìm thấy thông báo");
		}

		notification.DaDoc = true;
		await notification.save();
		return notification;
	}

	// Đánh dấu tất cả là đã đọc
	async markAllAsRead(MaNguoiNhan, LoaiNguoiNhan) {
		const result = await ThongBao.updateMany(
			{
				MaNguoiNhan,
				LoaiNguoiNhan,
				DaDoc: false,
				DaXoa: false,
			},
			{ DaDoc: true }
		);
		return { modifiedCount: result.modifiedCount };
	}

	// Đánh dấu tất cả thông báo admin đã đọc
	async markAllAdminAsRead() {
		const result = await ThongBao.updateMany(
			{
				LoaiNguoiNhan: "admin",
				DaDoc: false,
				DaXoa: false,
			},
			{ DaDoc: true }
		);
		return { modifiedCount: result.modifiedCount };
	}

	// Xóa thông báo
	async deleteNotification(MaThongBao, MaNguoiNhan = null) {
		const query = { MaThongBao };
		if (MaNguoiNhan) {
			query.MaNguoiNhan = MaNguoiNhan;
		}

		const notification = await ThongBao.findOne(query);
		if (!notification) {
			throw new ApiError(404, "Không tìm thấy thông báo");
		}

		notification.DaXoa = true;
		await notification.save();
		return { message: "Xóa thông báo thành công" };
	}

	// Kiểm tra và tạo thông báo sắp hết hạn (3 ngày trước)
	async checkAndCreateDueSoonNotifications() {
		const now = new Date();
		const dueSoonDate = new Date();
		dueSoonDate.setDate(now.getDate() + DAYS_BEFORE_DUE);

		// Tìm các phiếu mượn sắp hết hạn (trong 3 ngày tới)
		const borrowsDueSoon = await TheoDoiMuonSach.find({
			TinhTrang: "Đang mượn",
			NgayTra: { $gte: now, $lte: dueSoonDate },
			DaXoa: { $ne: true },
		}).lean();

		let createdCount = 0;

		for (const borrow of borrowsDueSoon) {
			// Kiểm tra xem đã có thông báo sắp hết hạn cho phiếu mượn này chưa
			const existingNotification = await ThongBao.findOne({
				MaPhieuMuon: borrow.MaPhieuMuon,
				LoaiThongBao: "sap_het_han",
				DaXoa: false,
			});

			if (!existingNotification) {
				// Lấy thông tin sách
				const book = await Sach.findOne({
					MaSach: borrow.MaSach,
				}).lean();
				const bookTitle = book ? book.TenSach : "Sách không xác định";

				const daysLeft = Math.ceil(
					(new Date(borrow.NgayTra) - now) / (1000 * 60 * 60 * 24)
				);

				await this.createNotification({
					LoaiNguoiNhan: "user",
					MaNguoiNhan: borrow.MaDocGia,
					LoaiThongBao: "sap_het_han",
					TieuDe: "Sách sắp hết hạn mượn",
					NoiDung: `Sách "${bookTitle}" sẽ hết hạn trong ${daysLeft} ngày (${new Date(
						borrow.NgayTra
					).toLocaleDateString(
						"vi-VN"
					)}). Vui lòng trả sách hoặc gia hạn.`,
					MaPhieuMuon: borrow.MaPhieuMuon,
					MaSach: borrow.MaSach,
				});

				createdCount++;
			}
		}

		return { createdCount, type: "sap_het_han" };
	}

	// Kiểm tra và tạo thông báo hết hạn
	async checkAndCreateOverdueNotifications() {
		const now = new Date();

		// Tìm các phiếu mượn quá hạn
		const overduesBorrows = await TheoDoiMuonSach.find({
			TinhTrang: "Quá hạn",
			DaXoa: { $ne: true },
		}).lean();

		let createdCount = 0;

		for (const borrow of overduesBorrows) {
			// Kiểm tra xem đã có thông báo hết hạn cho phiếu mượn này trong ngày hôm nay chưa
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const existingNotification = await ThongBao.findOne({
				MaPhieuMuon: borrow.MaPhieuMuon,
				LoaiThongBao: "het_han",
				createdAt: { $gte: today, $lt: tomorrow },
				DaXoa: false,
			});

			if (!existingNotification) {
				// Lấy thông tin sách
				const book = await Sach.findOne({
					MaSach: borrow.MaSach,
				}).lean();
				const bookTitle = book ? book.TenSach : "Sách không xác định";

				const daysOverdue = Math.ceil(
					(now - new Date(borrow.NgayTra)) / (1000 * 60 * 60 * 24)
				);
				const fine = daysOverdue * DAILY_FINE;

				await this.createNotification({
					LoaiNguoiNhan: "user",
					MaNguoiNhan: borrow.MaDocGia,
					LoaiThongBao: "het_han",
					TieuDe: "Sách đã quá hạn mượn",
					NoiDung: `Sách "${bookTitle}" đã quá hạn ${daysOverdue} ngày. Tiền phạt hiện tại: ${fine.toLocaleString(
						"vi-VN"
					)}đ. Vui lòng trả sách ngay.`,
					MaPhieuMuon: borrow.MaPhieuMuon,
					MaSach: borrow.MaSach,
				});

				createdCount++;
			}
		}

		return { createdCount, type: "het_han" };
	}

	// Kiểm tra và tạo thông báo tiền phạt chưa đóng
	async checkAndCreateFineNotifications() {
		// Tìm các độc giả có tiền phạt chưa đóng
		const readersWithFine = await DocGia.find({
			TienPhatChuaDong: { $gt: 0 },
			DaXoa: false,
		}).lean();

		let createdCount = 0;

		for (const reader of readersWithFine) {
			// Kiểm tra xem đã có thông báo tiền phạt trong ngày hôm nay chưa
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const existingNotification = await ThongBao.findOne({
				MaNguoiNhan: reader.MaDocGia,
				LoaiThongBao: "tien_phat",
				createdAt: { $gte: today, $lt: tomorrow },
				DaXoa: false,
			});

			if (!existingNotification) {
				await this.createNotification({
					LoaiNguoiNhan: "user",
					MaNguoiNhan: reader.MaDocGia,
					LoaiThongBao: "tien_phat",
					TieuDe: "Có tiền phạt chưa thanh toán",
					NoiDung: `Bạn có ${reader.TienPhatChuaDong.toLocaleString(
						"vi-VN"
					)}đ tiền phạt chưa thanh toán. Vui lòng thanh toán để tiếp tục sử dụng dịch vụ thư viện.`,
					MaPhieuMuon: null,
					MaSach: null,
				});

				createdCount++;
			}
		}

		return { createdCount, type: "tien_phat" };
	}

	// Kiểm tra và tạo thông báo cho các sách đã được đánh dấu mất (cho admin)
	async checkAndCreateLostBookNotifications() {
		const now = new Date();

		// Tìm các phiếu mượn đã được đánh dấu là "Mất sách"
		const lostBorrows = await TheoDoiMuonSach.find({
			TinhTrang: "Mất sách",
			DaXoa: { $ne: true },
		}).lean();

		let createdCount = 0;

		for (const borrow of lostBorrows) {
			// Kiểm tra xem đã có thông báo mất sách cho phiếu mượn này chưa
			const existingNotification = await ThongBao.findOne({
				MaPhieuMuon: borrow.MaPhieuMuon,
				LoaiThongBao: "mat_sach",
				DaXoa: false,
			});

			if (!existingNotification) {
				// Lấy thông tin sách và độc giả
				const [book, reader] = await Promise.all([
					Sach.findOne({ MaSach: borrow.MaSach }).lean(),
					DocGia.findOne({ MaDocGia: borrow.MaDocGia }).lean(),
				]);

				const bookTitle = book ? book.TenSach : "Sách không xác định";
				const readerName = reader
					? `${reader.HoLot || ""} ${reader.Ten || ""}`.trim()
					: "Độc giả không xác định";

				const lostFine = borrow.TienPhat || 0;

				await this.createNotification({
					LoaiNguoiNhan: "admin",
					MaNguoiNhan: borrow.MaDocGia, // Lưu mã độc giả để tham chiếu
					LoaiThongBao: "mat_sach",
					TieuDe: "Thông báo: Sách đã được đánh dấu mất",
					NoiDung: `Độc giả "${readerName}" đã bị đánh dấu mất sách "${bookTitle}". Tiền phạt: ${lostFine.toLocaleString(
						"vi-VN"
					)}đ. Tài khoản đã bị khóa quyền mượn.`,
					MaPhieuMuon: borrow.MaPhieuMuon,
					MaSach: borrow.MaSach,
				});

				createdCount++;
			}
		}

		return { createdCount, type: "mat_sach" };
	}

	// Chạy tất cả các kiểm tra thông báo
	async runAllNotificationChecks() {
		const results = await Promise.all([
			this.checkAndCreateDueSoonNotifications(),
			this.checkAndCreateOverdueNotifications(),
			this.checkAndCreateFineNotifications(),
			this.checkAndCreateLostBookNotifications(),
		]);

		return {
			dueSoon: results[0],
			overdue: results[1],
			fines: results[2],
			lostBooks: results[3],
			totalCreated: results.reduce((sum, r) => sum + r.createdCount, 0),
		};
	}

	// Lấy thông báo user kèm thông tin sách
	async getNotificationsByUserWithDetails(MaDocGia, includeRead = false) {
		const notifications = await this.getNotificationsByUser(
			MaDocGia,
			includeRead
		);

		const bookIds = [
			...new Set(notifications.map((n) => n.MaSach).filter(Boolean)),
		];
		const books = await Sach.find({ MaSach: { $in: bookIds } }).lean();

		const bookMap = {};
		for (const b of books) {
			bookMap[b.MaSach] = b.TenSach || "Unknown";
		}

		return notifications.map((n) => ({
			...n,
			bookTitle: bookMap[n.MaSach] || null,
		}));
	}

	// Kiểm tra và tạo thông báo cho một user cụ thể
	async checkNotificationsForUser(MaDocGia) {
		const now = new Date();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		let createdCount = 0;

		const dueSoonDate = new Date();
		dueSoonDate.setDate(now.getDate() + DAYS_BEFORE_DUE);

		const borrowsDueSoon = await TheoDoiMuonSach.find({
			MaDocGia,
			TinhTrang: "Đang mượn",
			NgayTra: { $gte: now, $lte: dueSoonDate },
			DaXoa: { $ne: true },
		}).lean();

		for (const borrow of borrowsDueSoon) {
			const existingNotification = await ThongBao.findOne({
				MaPhieuMuon: borrow.MaPhieuMuon,
				LoaiThongBao: "sap_het_han",
				DaXoa: false,
			});

			if (!existingNotification) {
				const book = await Sach.findOne({
					MaSach: borrow.MaSach,
				}).lean();
				const bookTitle = book ? book.TenSach : "Sách không xác định";
				const daysLeft = Math.ceil(
					(new Date(borrow.NgayTra) - now) / (1000 * 60 * 60 * 24)
				);

				await this.createNotification({
					LoaiNguoiNhan: "user",
					MaNguoiNhan: MaDocGia,
					LoaiThongBao: "sap_het_han",
					TieuDe: "Sách sắp hết hạn mượn",
					NoiDung: `Sách "${bookTitle}" sẽ hết hạn trong ${daysLeft} ngày (${new Date(
						borrow.NgayTra
					).toLocaleDateString(
						"vi-VN"
					)}). Vui lòng trả sách hoặc gia hạn.`,
					MaPhieuMuon: borrow.MaPhieuMuon,
					MaSach: borrow.MaSach,
				});
				createdCount++;
			}
		}

		// 2. Kiểm tra sách quá hạn
		const overdueBorrows = await TheoDoiMuonSach.find({
			MaDocGia,
			TinhTrang: "Quá hạn",
			DaXoa: { $ne: true },
		}).lean();

		for (const borrow of overdueBorrows) {
			const existingNotification = await ThongBao.findOne({
				MaPhieuMuon: borrow.MaPhieuMuon,
				LoaiThongBao: "het_han",
				createdAt: { $gte: today, $lt: tomorrow },
				DaXoa: false,
			});

			if (!existingNotification) {
				const book = await Sach.findOne({
					MaSach: borrow.MaSach,
				}).lean();
				const bookTitle = book ? book.TenSach : "Sách không xác định";
				const daysOverdue = Math.ceil(
					(now - new Date(borrow.NgayTra)) / (1000 * 60 * 60 * 24)
				);
				const fine = daysOverdue * DAILY_FINE;

				await this.createNotification({
					LoaiNguoiNhan: "user",
					MaNguoiNhan: MaDocGia,
					LoaiThongBao: "het_han",
					TieuDe: "Sách đã quá hạn mượn",
					NoiDung: `Sách "${bookTitle}" đã quá hạn ${daysOverdue} ngày. Tiền phạt hiện tại: ${fine.toLocaleString(
						"vi-VN"
					)}đ. Vui lòng trả sách ngay.`,
					MaPhieuMuon: borrow.MaPhieuMuon,
					MaSach: borrow.MaSach,
				});
				createdCount++;
			}
		}

		// 3. Kiểm tra tiền phạt chưa đóng
		const reader = await DocGia.findOne({ MaDocGia, DaXoa: false }).lean();
		if (reader && reader.TienPhatChuaDong > 0) {
			const existingNotification = await ThongBao.findOne({
				MaNguoiNhan: MaDocGia,
				LoaiThongBao: "tien_phat",
				createdAt: { $gte: today, $lt: tomorrow },
				DaXoa: false,
			});

			if (!existingNotification) {
				await this.createNotification({
					LoaiNguoiNhan: "user",
					MaNguoiNhan: MaDocGia,
					LoaiThongBao: "tien_phat",
					TieuDe: "Có tiền phạt chưa thanh toán",
					NoiDung: `Bạn có ${reader.TienPhatChuaDong.toLocaleString(
						"vi-VN"
					)}đ tiền phạt chưa thanh toán. Vui lòng thanh toán để tiếp tục sử dụng dịch vụ thư viện.`,
					MaPhieuMuon: null,
					MaSach: null,
				});
				createdCount++;
			}
		}

		return { createdCount };
	}
}

module.exports = new NotificationService();
