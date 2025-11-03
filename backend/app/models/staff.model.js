import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
const nhanVienSchema = new Schema(
	{
		MSNV: {
			type: String,
			default: () => nanoid(10),
			unique: true,
			index: true,
		},
		Email: {
			type: String,
			required: [true, "Email là bắt buộc"],
			trim: true,
			unique: true,
		},
		HoTenNV: {
			type: String,
			required: [true, "Họ tên là bắt buộc"],
			trim: true,
		},
		Password: {
			type: String,
			required: [true, "Mật khẩu là bắt buộc"],
			trim: true,
		},
		ChucVu: {
			type: String,
			required: [true, "Chức vụ là bắt buộc"],
			trim: true,
		},
		DiaChi: {
			type: String,
			required: [true, "Địa chỉ là bắt buộc"],
			trim: true,
		},
		SoDienThoai: {
			type: String,
			required: [true, "Số điện thoại là bắt buộc"],
			trim: true,
		},
		DaXoa: {
			type: Boolean,
			default: false,
		},
	},
	{
		collection: "NhanVien",
		timestamps: true,
	}
);
export default model("NhanVien", nhanVienSchema);
