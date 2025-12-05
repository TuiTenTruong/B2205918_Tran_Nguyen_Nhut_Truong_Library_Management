import createApiClient from "./api.service";
import adminApi from "./adminApi.service";
class BookService {
	constructor(baseUrl = "/api/books") {
		this.api = createApiClient(baseUrl);
	}

	async getAllBooks(filters = {}) {
		const res = await this.api.get("", { params: filters });
		return res.data.data || [];
	}

	async searchBooks(keyword) {
		const res = await this.api.get("/search", {
			params: { keyword },
		});
		return res.data.data || [];
	}

	async getBookById(id) {
		const res = await this.api.get(`/${id}`);
		return res.data;
	}

	async createBook(data) {
		const res = await this.api.post("", data, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data.data;
	}

	async updateBook(id, data) {
		const res = await this.api.put(`/${id}`, data, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data.data;
	}

	async deleteBook(id) {
		const res = await this.api.delete(`/${id}`);
		return res.data;
	}

	async deleteMultipleBooks(ids) {
		const res = await this.api.post("/delete-multiple", {
			MaSachArray: ids,
		});
		return res.data;
	}
}

export default new BookService();
