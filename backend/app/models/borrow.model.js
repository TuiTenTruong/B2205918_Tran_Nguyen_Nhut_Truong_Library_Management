const { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

const borrowSchema = new Schema(
	{
		MaPhieuMuon: {
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
		NgayMuon: {
			type: Date,
			required: [true, "Ngày mượn là bắt buộc"],
			default: Date.now,
		},
		NgayTra: {
			type: Date,
			required: [true, "Ngày trả là bắt buộc"],
		},
		NgayTraThucTe: {
			type: Date,
			default: null,
		},
		TinhTrang: {
			type: String,
			required: [true, "Tình trạng là bắt buộc"],
			enum: ["Đang mượn", "Đã trả", "Quá hạn"],
			default: "Đang mượn",
			trim: true,
		},
		DaXoa: {
			type: Boolean,
			default: false,
		},
		NhanVienXuLy: {
			type: String,
			required: [true, "Nhân viên xử lý là bắt buộc"],
			trim: true,
		},
	},
	{ timestamps: true, collection: "TheoDoiMuonSach" }
);

// Index để tìm kiếm nhanh
borrowSchema.index({ MaDocGia: 1, TinhTrang: 1 });
borrowSchema.index({ MaSach: 1, TinhTrang: 1 });
borrowSchema.index({ NgayMuon: -1 });

const TheoDoiMuonSach = model("TheoDoiMuonSach", borrowSchema);

module.exports = TheoDoiMuonSach;
