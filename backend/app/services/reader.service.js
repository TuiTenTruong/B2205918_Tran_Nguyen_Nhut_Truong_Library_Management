const DocGia = require("../models/reader.model");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

class ReaderService {
	async register(userData) {
		const {
			HoLot,
			Ten,
			Email,
			NgaySinh,
			Phai,
			DiaChi,
			DienThoai,
			MatKhau,
		} = userData;

		// Check if email or phone already exists
		const existingEmail = await DocGia.findOne({ Email });
		if (existingEmail) {
			throw new ApiError(409, "Email đã được đăng ký");
		}
		const existingPhone = await DocGia.findOne({ DienThoai });
		if (existingPhone) {
			throw new ApiError(409, "Số điện thoại đã được đăng ký");
		}

		// Hash password
		const hashedPassword = await hash(MatKhau, 10);

		// Create new reader
		const newReader = await DocGia.create({
			HoLot,
			Ten,
			Email,
			NgaySinh,
			Phai,
			DiaChi,
			DienThoai,
			MatKhau: hashedPassword,
		});

		await newReader.save();

		// Return the created reader data without the password
		return {
			MaDocGia: newReader.MaDocGia,
			HoLot: newReader.HoLot,
			Ten: newReader.Ten,
			Email: newReader.Email,
		};
	}
	async login(loginData) {
		console.log(loginData);
		const { Email, MatKhau } = loginData;

		// Find reader by email
		const reader = await DocGia.findOne({ Email });
		if (!reader) {
			throw new ApiError(401, "Đăng nhập thất bại");
		}
		// Compare password
		const isMatch = await compare(MatKhau, reader.MatKhau);
		if (!isMatch) {
			throw new ApiError(401, "Đăng nhập thất bại");
		}

		// Generate JWT token
		const Token = jwt.sign(
			{ id: reader.MaDocGia, email: reader.Email },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRE }
		);

		return {
			MaDocGia: reader.MaDocGia,
			HoLot: reader.HoLot,
			Ten: reader.Ten,
			Email: reader.Email,
			Token: Token,
		};
	}
	async getReaderById(MaDocGia) {
		const reader = await DocGia.findOne({ MaDocGia })
			.select("-MatKhau")
			.where({ DaXoa: false });
		if (!reader) {
			throw new Error("Không tìm thấy người dùng");
		}
		return reader;
	}

	async updateReader(MaDocGia, updateData) {
		const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = updateData;

		const reader = await DocGia.findOneAndUpdate(
			{ MaDocGia },
			{ HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai },
			{ new: true, runValidators: true }
		).select("-MatKhau");

		if (!reader) {
			throw new Error("Không tìm thấy người dùng");
		}

		return reader;
	}
	async deleteReader(MaDocGia) {
		const reader = await DocGia.findOneAndUpdate(
			{ MaDocGia },
			{ DaXoa: true },
			{ new: true }
		);

		if (!reader) {
			throw new Error("Không tìm thấy người dùng");
		}

		return { message: "Xóa người đọc thành công" };
	}

	async getAllReaders(filters = {}) {
		const { page = 1, limit = 10, search = "" } = filters;

		const query = { DaXoa: false };

		if (search) {
			query.$or = [
				{ Ten: { $regex: search, $options: "i" } },
				{ Email: { $regex: search, $options: "i" } },
			];
		}

		const skip = (page - 1) * limit;

		const readers = await DocGia.find(query)
			.select("-MatKhau")
			.limit(parseInt(limit))
			.skip(skip)
			.sort({ createdAt: -1 });

		const total = await DocGia.countDocuments(query);

		return {
			readers,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				totalPages: Math.ceil(total / limit),
			},
		};
	}
}

module.exports = new ReaderService();
