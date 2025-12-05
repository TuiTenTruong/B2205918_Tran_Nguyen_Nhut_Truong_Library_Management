const nodemailer = require("nodemailer");

class EmailService {
	constructor() {
		// Lấy và xử lý credentials
		const emailUser = process.env.EMAIL_USER?.trim();
		const emailPassword = process.env.EMAIL_PASSWORD?.replace(/\s+/g, "");
		const emailHost = process.env.EMAIL_HOST?.trim() || "smtp.gmail.com";
		const emailPort = parseInt(process.env.EMAIL_PORT) || 587;

		// Kiểm tra có đầy đủ thông tin không
		if (!emailUser || !emailPassword) {
			console.warn(
				"[Email Service] Missing EMAIL_USER or EMAIL_PASSWORD"
			);
			this.transporter = null;
			return;
		}

		// Cấu hình SMTP transporter
		this.transporter = nodemailer.createTransport({
			host: emailHost,
			port: emailPort,
			secure: emailPort === 465,
			auth: {
				user: emailUser,
				pass: emailPassword,
			},
		});

		console.log(
			`[Email Service] Configured with ${emailUser} on ${emailHost}:${emailPort}`
		);
	}

	// Gửi email nhắc nhở trước hạn trả sách
	async sendDueDateReminder(
		readerEmail,
		readerName,
		bookTitle,
		dueDate,
		daysLeft
	) {
		const mailOptions = {
			from: `"Thư Viện" <${process.env.EMAIL_USER}>`,
			to: readerEmail,
			subject: `Nhắc nhở: Sách "${bookTitle}" sắp đến hạn trả`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
					<h2 style="color: #ff9800;">Nhắc nhở trả sách</h2>
					<p>Xin chào <strong>${readerName}</strong>,</p>
					<p>Đây là thông báo nhắc nhở từ Thư viện:</p>
					
					<div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
						<p style="margin: 0;"><strong>Sách:</strong> ${bookTitle}</p>
						<p style="margin: 5px 0 0 0;"><strong>Ngày trả:</strong> ${new Date(
							dueDate
						).toLocaleDateString("vi-VN")}</p>
						<p style="margin: 5px 0 0 0; color: #f57c00;"><strong>Còn lại:</strong> ${daysLeft} ngày</p>
					</div>

					<p>Vui lòng trả sách đúng hạn để tránh bị phạt. Nếu bạn cần gia hạn, vui lòng đăng nhập vào hệ thống.</p>
					
					<p style="margin-top: 30px; font-size: 12px; color: #999;">
						Email này được gửi tự động từ Hệ thống Quản lý Thư viện.<br>
						Vui lòng không trả lời email này.
					</p>
				</div>
			`,
		};

		if (!this.transporter) {
			console.warn(
				"[Email] Email service not configured, skipping email"
			);
			return { success: false, error: "Email service not configured" };
		}

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log(
				`[Email] Sent due date reminder to ${readerEmail}:`,
				info.messageId
			);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error(
				`[Email] Error sending due date reminder:`,
				error.message
			);
			return { success: false, error: error.message };
		}
	}

	// Gửi email khi sách quá hạn
	async sendOverdueNotification(
		readerEmail,
		readerName,
		bookTitle,
		dueDate,
		daysOverdue,
		fine
	) {
		const mailOptions = {
			from: `"Thư Viện" <${process.env.EMAIL_USER}>`,
			to: readerEmail,
			subject: `Cảnh báo: Sách "${bookTitle}" đã quá hạn`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
					<h2 style="color: #f44336;">Cảnh báo quá hạn</h2>
					<p>Xin chào <strong>${readerName}</strong>,</p>
					<p>Sách bạn mượn đã <strong>quá hạn trả</strong>:</p>
					
					<div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
						<p style="margin: 0;"><strong>Sách:</strong> ${bookTitle}</p>
						<p style="margin: 5px 0 0 0;"><strong>Hạn trả:</strong> ${new Date(
							dueDate
						).toLocaleDateString("vi-VN")}</p>
						<p style="margin: 5px 0 0 0; color: #c62828;"><strong>Quá hạn:</strong> ${daysOverdue} ngày</p>
						<p style="margin: 5px 0 0 0; color: #c62828;"><strong>Tiền phạt:</strong> ${fine.toLocaleString(
							"vi-VN"
						)}đ</p>
					</div>

					<p><strong>Vui lòng trả sách ngay để tránh bị khóa tài khoản!</strong></p>
					<p style="font-size: 14px; color: #666;">
						Lưu ý: Nếu quá hạn 30 ngày, sách sẽ được đánh dấu là <strong>mất sách</strong> 
						và bạn sẽ bị khóa tài khoản trong 30 ngày.
					</p>
					
					<p style="margin-top: 30px; font-size: 12px; color: #999;">
						Email này được gửi tự động từ Hệ thống Quản lý Thư viện.<br>
						Vui lòng không trả lời email này.
					</p>
				</div>
			`,
		};

		if (!this.transporter) {
			console.warn(
				"[Email] Email service not configured, skipping email"
			);
			return { success: false, error: "Email service not configured" };
		}

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log(
				`[Email] Sent overdue notification to ${readerEmail}:`,
				info.messageId
			);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error(
				`[Email] Error sending overdue notification:`,
				error.message
			);
			return { success: false, error: error.message };
		}
	}

	// Gửi email khi sách đặt trước có sẵn
	async sendBookAvailableNotification(
		readerEmail,
		readerName,
		bookTitle,
		expiryDate
	) {
		const mailOptions = {
			from: `"Thư Viện" <${process.env.EMAIL_USER}>`,
			to: readerEmail,
			subject: `Sách "${bookTitle}" đã có sẵn để mượn`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
					<h2 style="color: #4caf50;">Sách đã có sẵn!</h2>
					<p>Xin chào <strong>${readerName}</strong>,</p>
					<p>Tin tốt! Sách bạn đặt trước đã có sẵn để mượn:</p>
					
					<div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
						<p style="margin: 0;"><strong>Sách:</strong> ${bookTitle}</p>
						<p style="margin: 5px 0 0 0;"><strong>Hạn đến lấy:</strong> ${new Date(
							expiryDate
						).toLocaleDateString("vi-VN")}</p>
					</div>

					<p><strong>Vui lòng đến thư viện để nhận sách trước ngày hết hạn!</strong></p>
					<p style="font-size: 14px; color: #666;">
						Mẹo: Bạn có thể đăng nhập vào hệ thống để xem chi tiết đơn đặt trước của mình.
					</p>
					
					<p style="margin-top: 30px; font-size: 12px; color: #999;">
						Email này được gửi tự động từ Hệ thống Quản lý Thư viện.<br>
						Vui lòng không trả lời email này.
					</p>
				</div>
			`,
		};

		if (!this.transporter) {
			console.warn(
				"[Email] Email service not configured, skipping email"
			);
			return { success: false, error: "Email service not configured" };
		}

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log(
				`[Email] Sent book available notification to ${readerEmail}:`,
				info.messageId
			);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error(
				`[Email] Error sending book available notification:`,
				error.message
			);
			return { success: false, error: error.message };
		}
	}

	// Gửi email khi bị khóa tài khoản (mất sách)
	async sendAccountBannedNotification(
		readerEmail,
		readerName,
		bookTitle,
		banUntil,
		fine
	) {
		const mailOptions = {
			from: `"Thư Viện" <${process.env.EMAIL_USER}>`,
			to: readerEmail,
			subject: `Tài khoản của bạn đã bị khóa`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
					<h2 style="color: #d32f2f;">Tài khoản bị khóa</h2>
					<p>Xin chào <strong>${readerName}</strong>,</p>
					<p>Tài khoản của bạn đã bị khóa quyền mượn sách:</p>
					
					<div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
						<p style="margin: 0;"><strong>Lý do:</strong> Sách "${bookTitle}" bị đánh dấu là mất sách</p>
						<p style="margin: 5px 0 0 0;"><strong>Khóa đến:</strong> ${new Date(
							banUntil
						).toLocaleDateString("vi-VN")}</p>
						<p style="margin: 5px 0 0 0; color: #c62828;"><strong>Tiền phạt:</strong> ${fine.toLocaleString(
							"vi-VN"
						)}đ</p>
					</div>

					<p><strong>Để mở khóa tài khoản, bạn cần:</strong></p>
					<ol>
						<li>Thanh toán toàn bộ tiền phạt</li>
						<li>Chờ hết hạn khóa (${new Date(banUntil).toLocaleDateString("vi-VN")})</li>
					</ol>
					
					<p style="font-size: 14px; color: #666;">
						Vui lòng liên hệ thư viện để biết thêm chi tiết.
					</p>
					
					<p style="margin-top: 30px; font-size: 12px; color: #999;">
						Email này được gửi tự động từ Hệ thống Quản lý Thư viện.<br>
						Vui lòng không trả lời email này.
					</p>
				</div>
			`,
		};

		if (!this.transporter) {
			console.warn(
				"[Email] Email service not configured, skipping email"
			);
			return { success: false, error: "Email service not configured" };
		}

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log(
				`[Email] Sent account banned notification to ${readerEmail}:`,
				info.messageId
			);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error(
				`[Email] Error sending account banned notification:`,
				error.message
			);
			return { success: false, error: error.message };
		}
	}

	// Kiểm tra kết nối email
	async verifyConnection() {
		if (!this.transporter) {
			console.warn("[Email] Email service not configured");
			return false;
		}

		try {
			await this.transporter.verify();
			console.log("[Email] SMTP connection verified successfully");
			return true;
		} catch (error) {
			console.error("[Email] SMTP connection error:", error.message);
			return false;
		}
	}
}

module.exports = new EmailService();
