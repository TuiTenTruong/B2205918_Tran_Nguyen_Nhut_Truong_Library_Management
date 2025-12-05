const { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

const reservationSchema = new Schema(
	{
		MaDatTruoc: {
			type: String,
			default: () => nanoid(10),
			unique: true,
			index: true,
		},
		MaDocGia: {
			type: String,
			required: [true, "Mã độc giả là bắt buộc"],
			trim: true,
			index: true,
		},
		MaSach: {
			type: String,
			required: [true, "Mã sách là bắt buộc"],
			trim: true,
			index: true,
		},
		NgayDat: {
			type: Date,
			default: Date.now,
		},
		TrangThai: {
			type: String,
			enum: [
				"Đang chờ",
				"Sẵn sàng",
				"Đã mượn",
				"Đã trả",
				"Hết hạn",
				"Đã hủy",
			],
			default: "Đang chờ",
			trim: true,
		},
		ThuTuHangDoi: {
			type: Number,
			default: 0,
		},
		NgaySanSang: {
			type: Date,
			default: null,
		},
		HanLaySach: {
			type: Date,
			default: null,
		},
		GhiChu: {
			type: String,
			default: "",
			trim: true,
		},
		DaXoa: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, collection: "DatTruocSach" }
);

reservationSchema.index({ MaSach: 1, TrangThai: 1, ThuTuHangDoi: 1 });
reservationSchema.index({ MaDocGia: 1, TrangThai: 1 });
reservationSchema.index({ NgayDat: -1 });

const DatTruocSach = model("DatTruocSach", reservationSchema);

module.exports = DatTruocSach;
