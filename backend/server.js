const dotenv = require("dotenv");

// Load .env TRƯỚC KHI import bất kỳ module nào
dotenv.config();

const app = require("./app");
const config = require("./app/config");
const connectDB = require("./app/config/database");
const emailScheduler = require("./app/services/emailScheduler.service");
const emailService = require("./app/services/email.service");

async function startServer() {
	try {
		await connectDB();

		// Kiểm tra kết nối email (không bắt buộc)
		const emailConnected = await emailService.verifyConnection();
		if (emailConnected) {
			console.log("✅ Email service is ready");
			// Khởi động các job gửi email tự động
			emailScheduler.startAll();
			console.log("✅ Email scheduler started");
		} else {
			console.warn("⚠️ Email service is not configured. Email notifications will be disabled.");
			console.warn("   To enable email notifications, set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env file");
		}

		const PORT = config.app.port;
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}.`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
	}
}

startServer();
