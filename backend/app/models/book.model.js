// import { Schema, model } from "mongoose";
// import { nanoid } from "nanoid";
// const bookSchema = new Schema(
// 	{
// 		MaSach: {
// 			type: String,
// 			default: () => nanoid(10),
// 			unique: true,
// 			index: true,
// 		},
// 		TenSach: {
// 			type: String,
// 			required: [true, "Tên sách là bắt buộc"],
// 			trim: true,
// 		},
// 		AnhBia: {
// 			type: String,
// 			required: [true, "Ảnh bìa là bắt buộc"],
// 			trim: true,
// 		},
// 		DonGia: {
// 			type: Number,
// 			required: [true, "Đơn giá là bắt buộc"],
// 			trim: true,
// 		},
// 		SoQuyen: {
// 			type: Number,
// 			required: [true, "Số quyển là bắt buộc"],
// 			trim: true,
// 		},
// 		NamXuatBan: {
// 			type: Number,
// 			required: [true, "Năm xuất bản là bắt buộc"],
// 			trim: true,
// 		},
// 		MaNhaXuatBan: {
// 			type: String,
// 			required: [true, "Mã nhà xuất bản là bắt buộc"],
// 			trim: true,
// 		},
// 		NguonGoc_TacGia: {
// 			type: String,
// 			required: [true, "Tác giả là bắt buộc"],
// 			trim: true,
// 		},
// 		DaXoa: {
// 			type: Boolean,
// 			default: false,
// 		},
// 	},
// 	{ timestamps: true, collection: "Sach" }
// );

// export default model("Sach", bookSchema);
