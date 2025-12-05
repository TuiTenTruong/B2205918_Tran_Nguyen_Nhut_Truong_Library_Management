import createApiClient from "./api.service";
import adminApi from "./adminApi.service";

class ReaderService {
	constructor(baseUrl = "/api/readers") {
		// client cho độc giả
		this.api = createApiClient(baseUrl);
	}

	// Hàm đăng ký độc giả
	async register(payload) {
		const res = await this.api.post("/register", payload);
		return res.data;
	}

	// Hàm đăng nhập độc giả
	async login(payload) {
		const res = await this.api.post("/login", payload);
		return res.data;
	}

	// Hàm toggle yêu thích sách của độc giả
	async toggleFavorite(bookId) {
		const res = await this.api.post(`/favorite/${bookId}`);
		return res.data;
	}

	// Hàm lấy danh sách sách yêu thích của độc giả
	async getFavorites() {
		const res = await this.api.get("/favorite");
		return res.data.data || [];
	}

	// Hàm lấy hồ sơ của chính độc giả
	async getMyProfile() {
		const res = await this.api.get("/profile");
		return res.data;
	}

	// Hàm lấy hồ sơ 1 độc giả theo id
	async getUserProfile(id) {
		const res = await this.api.get(`/profile/${id}`);
		return res.data;
	}

	// Hàm cập nhật hồ sơ độc giả
	async updateProfile(data) {
		const res = await this.api.put("/profile", data);
		return res.data;
	}

	// ====== PHẦN DƯỚI CHO ADMIN DÙNG ======

	// Hàm admin lấy danh sách độc giả
	async getAllReaders(params) {
		const res = await adminApi.get("/readers", { params });
		return res.data;
	}

	// Hàm admin xóa 1 độc giả
	async deleteReader(id) {
		const res = await adminApi.delete(`/readers/${id}`);
		return res.data;
	}

	// Hàm admin cập nhật thông tin độc giả
	async updateReaderByAdmin(id, data) {
		const res = await adminApi.put(`/readers/${id}`, data);
		return res.data;
	}
}

export default new ReaderService();
