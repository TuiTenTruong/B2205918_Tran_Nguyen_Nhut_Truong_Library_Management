const { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

const bookSchema = new Schema(
	{
		MaSach: {
			type: String,
			default: () => nanoid(10),
			unique: true,
			index: true,
		},
		TenSach: {
			type: String,
			required: [true, "Tên sách là bắt buộc"],
			trim: true,
		},
		AnhBia: {
			type: String,
			default: "default-book-cover.jpg",
			trim: true,
		},
		MoTa: {
			type: String,
			required: [true, "Mô tả là bắt buộc"],
			trim: true,
		},
		DonGia: {
			type: Number,
			required: [true, "Đơn giá là bắt buộc"],
			min: [0, "Đơn giá phải lớn hơn hoặc bằng 0"],
		},
		SoQuyen: {
			type: Number,
			required: [true, "Số quyển là bắt buộc"],
			min: [0, "Số quyển phải lớn hơn hoặc bằng 0"],
		},
		NamXuatBan: {
			type: Number,
			required: [true, "Năm xuất bản là bắt buộc"],
			min: [1000, "Năm xuất bản không hợp lệ"],
			max: [new Date().getFullYear() + 1, "Năm xuất bản không hợp lệ"],
		},
		MaNXB: {
			type: String,
			required: [true, "Mã nhà xuất bản là bắt buộc"],
			trim: true,
		},
		NguonGoc_TacGia: {
			type: String,
			required: [true, "Tác giả là bắt buộc"],
			trim: true,
		},
		YeuThich: {
			type: Number,
			default: 0,
		},
		DaXoa: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, collection: "Sach" }
);

module.exports = model("Sach", bookSchema);
