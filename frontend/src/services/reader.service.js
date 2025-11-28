import createApiClient from "./api.service";

class ReaderService {
	constructor(baseUrl = "/api/readers") {
		this.api = createApiClient(baseUrl);
	}

	async register(payload) {
		const res = await this.api.post("/register", payload);
		return res.data;
	}

	async login(payload) {
		const res = await this.api.post("/login", payload);
		return res.data;
	}
	async toggleFavorite(bookId) {
		const res = await this.api.post(`/favorite/${bookId}`);
		return res.data;
	}

	async getFavorites() {
		const res = await this.api.get("/favorite");
		return res.data.data || [];
	}

	async getMyProfile() {
		return (await this.api.get("/profile")).data;
	}

	async getUserProfile(id) {
		return (await this.api.get(`/profile/${id}`)).data;
	}

	async updateProfile(data) {
		return (await this.api.put(`/profile`, data)).data;
	}

	async getAllReaders() {
		return (await this.api.get("/")).data;
	}

	async deleteReader(id) {
		return (await this.api.delete(`/${id}`)).data;
	}
}
export default new ReaderService();
