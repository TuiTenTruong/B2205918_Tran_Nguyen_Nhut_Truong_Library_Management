// seedBooks.js - Dùng để import dữ liệu sách mẫu vào MongoDB
const fs = require("fs");
const path = require("path");
const connectDB = require("./app/config/database");
const Sach = require("./app/models/book.model");

const run = async () => {
	try {
		await connectDB();

		const filePath = path.join(__dirname, "books_seed.json");
		const raw = fs.readFileSync(filePath, "utf-8");
		const data = JSON.parse(raw);

		// Xoá hết sách cũ nếu muốn
		await Sach.deleteMany({});

		// insertMany sẽ chạy default (bao gồm MaSach = nanoid)
		await Sach.insertMany(data);

		console.log("Import Sach thành công!");
		process.exit(0);
	} catch (err) {
		console.error("Lỗi import:", err);
		process.exit(1);
	}
};

run();
