import createApiClient from "./api.service";
import adminApi from "./adminApi.service";

class PublisherService {
	constructor(baseUrl = "/api/publishers") {
		this.api = createApiClient(baseUrl);
	}

	// Lấy tất cả nhà xuất bản
	async getAllPublishers() {
		const response = await this.api.get("/");
		return response.data;
	}

	// Tìm kiếm nhà xuất bản
	async searchPublishers(keyword) {
		const response = await this.api.get("/search", {
			params: { keyword },
		});
		return response.data;
	}

	// Lấy nhà xuất bản theo ID
	async getPublisherById(id) {
		const response = await this.api.get(`/${id}`);
		return response.data;
	}

	// Lấy thống kê nhà xuất bản
	async getPublisherStats(id) {
		const response = await this.api.get(`/${id}/stats`);
		return response.data;
	}

	// ==== PHÍA ADMIN ====

	// Tạo nhà xuất bản mới
	async createPublisher(publisherData) {
		const res = await adminApi.post("/publishers", publisherData);
		return res.data;
	}

	// Cập nhật nhà xuất bản
	async updatePublisher(id, publisherData) {
		const res = await adminApi.put(`/publishers/${id}`, publisherData);
		return res.data;
	}

	// Xóa nhà xuất bản
	async deletePublisher(id) {
		const res = await adminApi.delete(`/publishers/${id}`);
		return res.data;
	}
}

export default new PublisherService();
