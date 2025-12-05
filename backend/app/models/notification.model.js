const { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

const notificationSchema = new Schema(
	{
		MaThongBao: {
			type: String,
			default: () => nanoid(10),
			unique: true,
			index: true,
		},
		LoaiNguoiNhan: {
			type: String,
			required: true,
			enum: ["user", "admin"],
			index: true,
		},
		MaNguoiNhan: {
			type: String,
			required: true,
			index: true,
		},
		LoaiThongBao: {
			type: String,
			required: true,
			enum: [
				"sap_het_han",
				"het_han",
				"tien_phat",
				"mat_sach",
				"dat_truoc_san_sang",
			],
			index: true,
		},
		TieuDe: {
			type: String,
			required: true,
			trim: true,
		},
		NoiDung: {
			type: String,
			required: true,
			trim: true,
		},
		MaPhieuMuon: {
			type: String,
			default: null,
		},
		MaSach: {
			type: String,
			default: null,
		},
		DaDoc: {
			type: Boolean,
			default: false,
		},
		DaXoa: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		collection: "ThongBao",
	}
);

// Index để tìm kiếm nhanh
notificationSchema.index({ MaNguoiNhan: 1, DaDoc: 1 });
notificationSchema.index({ createdAt: -1 });

const ThongBao = model("ThongBao", notificationSchema);

module.exports = ThongBao;
