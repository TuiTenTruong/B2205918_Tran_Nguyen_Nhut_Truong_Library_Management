const { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

const publisherSchema = new Schema(
	{
		MaNXB: {
			type: String,
			default: () => nanoid(10),
			unique: true,
			index: true,
		},
		TenNXB: {
			type: String,
			required: [true, "Tên nhà xuất bản là bắt buộc"],
			trim: true,
		},
		DiaChi: {
			type: String,
			required: [true, "Địa chỉ là bắt buộc"],
			trim: true,
		},
		DaXoa: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, collection: "NhaXuatBan" }
);

module.exports = model("NhaXuatBan", publisherSchema);
