const NhaXuatBan = require("../models/publisher.model");
const ApiError = require("../api-error");

class PublisherService {
	// Tạo nhà xuất bản mới
	async createPublisher(publisherData) {
		const { TenNXB, DiaChi } = publisherData;

		// Kiểm tra tên nhà xuất bản đã tồn tại chưa
		const existingPublisher = await NhaXuatBan.findOne({ TenNXB });
		if (existingPublisher) {
			throw new ApiError(409, "Tên nhà xuất bản đã tồn tại");
		}

		const newPublisher = new NhaXuatBan({
			TenNXB,
			DiaChi,
		});

		await newPublisher.save();
		return newPublisher;
	}

	// Lấy tất cả nhà xuất bản
	async getAllPublishers(filters = {}) {
		const query = {};

		// Thêm filters nếu có
		if (filters.TenNXB) {
			query.TenNXB = { $regex: filters.TenNXB, $options: "i" };
		}
		if (filters.DiaChi) {
			query.DiaChi = { $regex: filters.DiaChi, $options: "i" };
		}

		const publishers = await NhaXuatBan.find(query).sort({
			createdAt: -1,
		});
		return publishers;
	}

	// Lấy nhà xuất bản theo ID
	async getPublisherById(MaNXB) {
		const publisher = await NhaXuatBan.findOne({ MaNXB });
		if (!publisher) {
			throw new ApiError(404, "Không tìm thấy nhà xuất bản");
		}
		return publisher;
	}

	// Cập nhật nhà xuất bản
	async updatePublisher(MaNXB, publisherData) {
		const publisher = await NhaXuatBan.findOne({ MaNXB });
		if (!publisher) {
			throw new ApiError(404, "Không tìm thấy nhà xuất bản");
		}

		const { TenNXB, DiaChi } = publisherData;

		// Kiểm tra tên mới có trùng với nhà xuất bản khác không
		if (TenNXB && TenNXB !== publisher.TenNXB) {
			const existingPublisher = await NhaXuatBan.findOne({ TenNXB });
			if (existingPublisher) {
				throw new ApiError(409, "Tên nhà xuất bản đã tồn tại");
			}
			publisher.TenNXB = TenNXB;
		}

		if (DiaChi) publisher.DiaChi = DiaChi;

		await publisher.save();
		return publisher;
	}

	// Xóa nhà xuất bản
	async deletePublisher(MaNXB) {
		const publisher = await NhaXuatBan.findOne({ MaNXB });
		if (!publisher) {
			throw new ApiError(404, "Không tìm thấy nhà xuất bản");
		}

		// Kiểm tra xem có sách nào đang sử dụng nhà xuất bản này không
		const Sach = require("../models/book.model");
		const booksUsingPublisher = await Sach.findOne({
			MaNhaXuatBan: MaNXB,
			DaXoa: false,
		});

		if (booksUsingPublisher) {
			throw new ApiError(
				400,
				"Không thể xóa nhà xuất bản đang được sử dụng bởi sách"
			);
		}

		await NhaXuatBan.deleteOne({ MaNXB });
		return publisher;
	}

	// Tìm kiếm nhà xuất bản
	async searchPublishers(keyword) {
		const publishers = await NhaXuatBan.find({
			$or: [
				{ TenNXB: { $regex: keyword, $options: "i" } },
				{ DiaChi: { $regex: keyword, $options: "i" } },
			],
		}).sort({ createdAt: -1 });

		return publishers;
	}

	// Lấy thống kê về nhà xuất bản
	async getPublisherStats(MaNXB) {
		const publisher = await this.getPublisherById(MaNXB);

		const Sach = require("../models/book.model");
		const totalBooks = await Sach.countDocuments({
			MaNhaXuatBan: MaNXB,
			DaXoa: false,
		});

		const totalQuantity = await Sach.aggregate([
			{
				$match: {
					MaNhaXuatBan: MaNXB,
					DaXoa: false,
				},
			},
			{
				$group: {
					_id: null,
					total: { $sum: "$SoQuyen" },
				},
			},
		]);

		return {
			publisher,
			totalBooks,
			totalQuantity: totalQuantity[0]?.total || 0,
		};
	}
}

module.exports = new PublisherService();
