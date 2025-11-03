const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const docGiaSchema = new mongoose.Schema(
	{
		MaDocGia: {
			type: String,
			default: () => nanoid(10),
			unique: true,
			index: true,
		},
		HoLot: {
			type: String,
			required: [true, "Họ lót là bắt buộc"],
			trim: true,
		},
		Ten: {
			type: String,
			required: [true, "Tên là bắt buộc"],
			trim: true,
		},
		Email: {
			type: String,
			required: [true, "Email là bắt buộc"],
			trim: true,
			unique: true,
		},
		NgaySinh: {
			type: Date,
			required: [true, "Ngày sinh là bắt buộc"],
			trim: true,
		},
		Phai: {
			type: String,
			required: [true, "Giới tính là bắt buộc"],
			trim: true,
		},
		DiaChi: {
			type: String,
			required: [true, "Địa chỉ là bắt buộc"],
			trim: true,
		},
		DienThoai: {
			type: String,
			required: [true, "Số điện thoại là bắt buộc"],
			trim: true,
		},
		MatKhau: {
			type: String,
			required: [true, "Mật khẩu là bắt buộc"],
			trim: true,
		},
		Muon: [
			{
				MASACH: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Sach",
				},
				NGAYMUON: {
					type: Date,
					default: Date.now,
				},
				NGAYTRA: Date,
				TRANGTHAI: {
					type: String,
					enum: ["pending", "approved", "returned"],
					default: "pending",
				},
			},
		],
		DaXoa: {
			type: Boolean,
			default: false,
		},
	},
	{
		collection: "DocGia",
		timestamps: true,
	}
);

module.exports = mongoose.model("DocGia", docGiaSchema);
