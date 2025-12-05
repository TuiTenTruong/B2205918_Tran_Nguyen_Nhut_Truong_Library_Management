const cron = require("node-cron");
const TheoDoiMuonSach = require("../models/borrow.model");
const DocGia = require("../models/reader.model");
const Sach = require("../models/book.model");
const emailService = require("./email.service");

class EmailSchedulerService {
	constructor() {
		this.jobs = [];
	}

	// Gửi email nhắc trước hạn trả sách (mỗi ngày lúc 9:00 sáng)
	startDueDateReminderJob() {
		// Chạy mỗi ngày lúc 9:00 sáng
		const job = cron.schedule("0 9 * * *", async () => {
			console.log("[Email Scheduler] Running due date reminder job...");
			try {
				await this.sendDueDateReminders();
			} catch (error) {
				console.error(
					"[Email Scheduler] Error in due date reminder job:",
					error.message
				);
			}
		});

		this.jobs.push({ name: "dueDateReminder", job });
		console.log(
			"[Email Scheduler] Due date reminder job scheduled (daily at 9:00 AM)"
		);
		return job;
	}

	// Gửi email nhắc sách quá hạn (mỗi ngày lúc 10:00 sáng)
	startOverdueReminderJob() {
		// Chạy mỗi ngày lúc 10:00 sáng
		const job = cron.schedule("0 10 * * *", async () => {
			console.log("[Email Scheduler] Running overdue reminder job...");
			try {
				await this.sendOverdueReminders();
			} catch (error) {
				console.error(
					"[Email Scheduler] Error in overdue reminder job:",
					error.message
				);
			}
		});

		this.jobs.push({ name: "overdueReminder", job });
		console.log(
			"[Email Scheduler] Overdue reminder job scheduled (daily at 10:00 AM)"
		);
		return job;
	}

	// Logic gửi email nhắc trước hạn trả
	async sendDueDateReminders() {
		const now = new Date();
		const threeDaysLater = new Date(now);
		threeDaysLater.setDate(now.getDate() + 3);
		threeDaysLater.setHours(23, 59, 59, 999);

		const oneDayLater = new Date(now);
		oneDayLater.setDate(now.getDate() + 1);
		oneDayLater.setHours(0, 0, 0, 0);

		// Tìm các phiếu mượn sắp đến hạn (trong 1-3 ngày tới)
		const upcomingBorrows = await TheoDoiMuonSach.find({
			TinhTrang: "Đang mượn",
			NgayTra: {
				$gte: oneDayLater,
				$lte: threeDaysLater,
			},
			DaXoa: { $ne: true },
		}).lean();

		console.log(
			`[Email Scheduler] Found ${upcomingBorrows.length} borrows due in 1-3 days`
		);

		let sentCount = 0;
		let errorCount = 0;

		for (const borrow of upcomingBorrows) {
			try {
				const reader = await DocGia.findOne({
					MaDocGia: borrow.MaDocGia,
				}).lean();
				const book = await Sach.findOne({
					MaSach: borrow.MaSach,
				}).lean();

				if (!reader) {
					console.log(
						`[Email Scheduler] Skipping - reader not found: ${borrow.MaDocGia}`
					);
					continue;
				}
				if (!book) {
					console.log(
						`[Email Scheduler] Skipping - book not found: ${borrow.MaSach}`
					);
					continue;
				}
				if (!reader.Email) {
					console.log(
						`[Email Scheduler] Skipping - reader has no email: ${borrow.MaDocGia}`
					);
					continue;
				}

				const daysLeft = Math.ceil(
					(new Date(borrow.NgayTra) - now) / (1000 * 60 * 60 * 24)
				);
				const readerName = `${reader.HoLot || ""} ${
					reader.Ten || ""
				}`.trim();

				console.log(
					`[Email Scheduler] Sending due date reminder to ${reader.Email} for book "${book.TenSach}"`
				);

				const result = await emailService.sendDueDateReminder(
					reader.Email,
					readerName,
					book.TenSach,
					borrow.NgayTra,
					daysLeft
				);

				if (result.success) {
					sentCount++;
					console.log(
						`[Email Scheduler] ✓ Sent successfully to ${reader.Email}`
					);
				} else {
					errorCount++;
					console.error(
						`[Email Scheduler] ✗ Failed to send to ${reader.Email}:`,
						result.error
					);
				}
			} catch (error) {
				console.error(
					`[Email Scheduler] ✗ Exception for borrow ${borrow.MaPhieuMuon}:`,
					error.message
				);
				console.error(`[Email Scheduler] Stack:`, error.stack);
				errorCount++;
			}
		}

		console.log(
			`[Email Scheduler] Due date reminders: ${sentCount} sent, ${errorCount} errors`
		);
		return { sentCount, errorCount };
	}

	// Logic gửi email nhắc sách quá hạn
	async sendOverdueReminders() {
		const now = new Date();

		// Tìm các phiếu mượn quá hạn
		const overdueBorrows = await TheoDoiMuonSach.find({
			TinhTrang: "Quá hạn",
			DaXoa: { $ne: true },
		}).lean();

		console.log(
			`[Email Scheduler] Found ${overdueBorrows.length} overdue borrows`
		);

		let sentCount = 0;
		let errorCount = 0;

		for (const borrow of overdueBorrows) {
			try {
				const reader = await DocGia.findOne({
					MaDocGia: borrow.MaDocGia,
				}).lean();
				const book = await Sach.findOne({
					MaSach: borrow.MaSach,
				}).lean();

				if (!reader) {
					console.log(
						`[Email Scheduler] Skipping - reader not found: ${borrow.MaDocGia}`
					);
					continue;
				}
				if (!book) {
					console.log(
						`[Email Scheduler] Skipping - book not found: ${borrow.MaSach}`
					);
					continue;
				}
				if (!reader.Email) {
					console.log(
						`[Email Scheduler] Skipping - reader has no email: ${borrow.MaDocGia}`
					);
					continue;
				}

				const daysOverdue = Math.ceil(
					(now - new Date(borrow.NgayTra)) / (1000 * 60 * 60 * 24)
				);
				const fine = daysOverdue * 2000; // 2000đ/ngày
				const readerName = `${reader.HoLot || ""} ${
					reader.Ten || ""
				}`.trim();

				console.log(
					`[Email Scheduler] Sending overdue email to ${reader.Email} for book "${book.TenSach}"`
				);

				const result = await emailService.sendOverdueNotification(
					reader.Email,
					readerName,
					book.TenSach,
					borrow.NgayTra,
					daysOverdue,
					fine
				);

				if (result.success) {
					sentCount++;
					console.log(
						`[Email Scheduler] ✓ Sent successfully to ${reader.Email}`
					);
				} else {
					errorCount++;
					console.error(
						`[Email Scheduler] ✗ Failed to send to ${reader.Email}:`,
						result.error
					);
				}
			} catch (error) {
				console.error(
					`[Email Scheduler] ✗ Exception for borrow ${borrow.MaPhieuMuon}:`,
					error.message
				);
				console.error(`[Email Scheduler] Stack:`, error.stack);
				errorCount++;
			}
		}

		console.log(
			`[Email Scheduler] Overdue reminders: ${sentCount} sent, ${errorCount} errors`
		);
		return { sentCount, errorCount };
	}

	// Khởi động tất cả các job
	startAll() {
		console.log("[Email Scheduler] Starting all scheduled jobs...");
		this.startDueDateReminderJob();
		this.startOverdueReminderJob();
	}

	// Dừng tất cả các job
	stopAll() {
		console.log("[Email Scheduler] Stopping all scheduled jobs...");
		this.jobs.forEach(({ name, job }) => {
			job.stop();
			console.log(`[Email Scheduler] Stopped job: ${name}`);
		});
		this.jobs = [];
	}
}

module.exports = new EmailSchedulerService();
