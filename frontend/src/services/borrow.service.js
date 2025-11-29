import createApiClient from "./api.service";

class BorrowService {
	constructor(baseUrl = "/api/borrows") {
		this.api = createApiClient(baseUrl);
	}
	async createBorrow(borrowData) {
		const response = await this.api.post("/", borrowData);
		return response.data;
	}

	// Hàm độc giả mượn sách cho chính mình
	async borrowSelf(maSach, ngayTra) {
		const response = await this.api.post("/self", {
			MaSach: maSach,
			NgayTra: ngayTra,
		});
		return response.data;
	}
	async getBorrowsByReader(maDocGia) {
		const response = await this.api.get(`/reader/${maDocGia}`);
		return response.data;
	}
}
export default new BorrowService();
