import {
	findOne,
	create,
	findOneAndUpdate,
	find,
	countDocuments,
} from "../models/staff.model";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import ApiError from "../api-error";

class StaffService {
	async createStaffAccount(staff) {
		const { MSNV, Email, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai } =
			staff;

		// Check if email or phone already exists
		const existingEmail = await findOne({ Email });
		if (existingEmail) {
			throw new ApiError(409, "Email đã được đăng ký");
		}
		const existingPhone = await findOne({ SoDienThoai });
		if (existingPhone) {
			throw new ApiError(409, "Số điện thoại đã được đăng ký");
		}

		// Hash password
		const hashedPassword = await hash(Password, 10);

		// Create new staff
		const newStaff = await create({
			MSNV,
			Email,
			HoTenNV,
			Password: hashedPassword,
			ChucVu,
			DiaChi,
			SoDienThoai,
		});

		await newStaff.save();

		// Return the created staff data without the password
		return {
			MSNV: newStaff.MSNV,
			Email: newStaff.Email,
			HoTenNV: newStaff.HoTenNV,
			ChucVu: newStaff.ChucVu,
			DiaChi: newStaff.DiaChi,
			SoDienThoai: newStaff.SoDienThoai,
		};
	}
	async loginAsStaff(loginData) {
		console.log(loginData);
		const { Email, Password } = loginData;

		// Find staff by email
		const staff = await findOne({ Email });
		if (!staff) {
			throw new ApiError(401, "Đăng nhập thất bại");
		}
		// Compare password
		const isMatch = await compare(Password, staff.Password);
		if (!isMatch) {
			throw new ApiError(401, "Đăng nhập thất bại");
		}

		// Generate JWT token
		const Token = sign(
			{ id: staff.MSNV, email: staff.Email },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRE }
		);

		return {
			MSNV: staff.MSNV,
			HoTenNV: staff.HoTenNV,
			Email: staff.Email,
			Token: Token,
		};
	}
	async getStaffById(MSNV) {
		const staff = await findOne({ MSNV })
			.select("-Password")
			.where({ DaXoa: false });
		if (!staff) {
			throw new Error("Không tìm thấy nhân viên");
		}
		return staff;
	}

	async updateStaff(MSNV, updateData) {
		const { HoTenNV, ChucVu, DiaChi, SoDienThoai } = updateData;

		const staff = await findOneAndUpdate(
			{ MSNV },
			{ HoTenNV, ChucVu, DiaChi, SoDienThoai },
			{ new: true, runValidators: true }
		).select("-Password");

		if (!staff) {
			throw new Error("Không tìm thấy nhân viên");
		}

		return staff;
	}
	async deleteStaff(MSNV) {
		const staff = await findOneAndUpdate(
			{ MSNV },
			{ DaXoa: true },
			{ new: true }
		);

		if (!staff) {
			throw new Error("Không tìm thấy nhân viên");
		}

		return { message: "Xóa nhân viên thành công" };
	}

	async getAllStaffs(filters = {}) {
		const { page = 1, limit = 10, search = "" } = filters;

		const query = { DaXoa: false };

		if (search) {
			query.$or = [
				{ Ten: { $regex: search, $options: "i" } },
				{ Email: { $regex: search, $options: "i" } },
			];
		}

		const skip = (page - 1) * limit;

		const staffs = await find(query)
			.select("-Password")
			.limit(parseInt(limit))
			.skip(skip)
			.sort({ createdAt: -1 });

		const total = await countDocuments(query);

		return {
			staffs,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				totalPages: Math.ceil(total / limit),
			},
		};
	}
}

export default new StaffService();
