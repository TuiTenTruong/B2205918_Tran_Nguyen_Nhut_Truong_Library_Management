import createApiClient from "./api.service";
import adminApi from "./adminApi.service";

class BorrowService {
	constructor(baseUrl = "/api/borrows") {
		// client cho độc giả
		this.api = createApiClient(baseUrl);
	}

	// ==== PHÍA ĐỘC GIẢ ====

	// Tạo phiếu mượn (nếu anh có dùng bên user)
	async createBorrow(borrowData) {
		const response = await this.api.post("/", borrowData);
		return response.data;
	}

	// Độc giả mượn sách cho chính mình
	async borrowSelf(maSach, ngayTra) {
		const response = await this.api.post("/self", {
			MaSach: maSach,
			NgayTra: ngayTra,
		});
		return response.data;
	}

	// Lịch sử mượn của 1 độc giả
	async getBorrowsByReader(maDocGia) {
		const response = await this.api.get(`/reader/${maDocGia}`);
		return response.data;
	}

	// Độc giả tự gia hạn sách
	async renewBorrow(maPhieuMuon) {
		const response = await this.api.put(`/${maPhieuMuon}/renew`);
		return response.data;
	}

	// ==== PHÍA ADMIN ====

	// Thống kê mượn trả cho dashboard admin
	async getStatistics() {
		const res = await adminApi.get("/borrows/statistics");
		return res.data;
	}

	// Danh sách phiếu mượn quá hạn
	async getOverdueBorrows() {
		const res = await adminApi.get("/borrows/overdue");
		return res.data;
	}

	// Lấy tất cả phiếu mượn (cho trang quản lý mượn trả)
	async getAllBorrowsAdmin() {
		const res = await adminApi.get("/borrows");
		return res.data;
	}

	// Admin tạo phiếu mượn
	async createBorrowAdmin(borrowData) {
		const res = await adminApi.post("/borrows", borrowData);
		return res.data;
	}

	// Admin xác nhận trả sách
	async returnBorrowAdmin(maPhieuMuon, ngayTraThucTe) {
		const res = await adminApi.put(`/borrows/${maPhieuMuon}/return`, {
			NgayTraThucTe: ngayTraThucTe,
		});
		return res.data;
	}

	// Admin lấy danh sách phiếu mượn có tiền phạt (lấy tất cả và lọc bên frontend)
	async getFinesAdmin() {
		const res = await adminApi.get("/borrows");
		return res.data;
	}

	// Admin đánh dấu đã thanh toán tiền phạt
	async markFinePaid(maPhieuMuon, amount) {
		const res = await adminApi.put(`/borrows/${maPhieuMuon}/pay-fine`, {
			amount,
		});
		return res.data;
	}

	// Admin gia hạn sách
	async renewBorrowAdmin(maPhieuMuon) {
		const res = await adminApi.put(`/borrows/${maPhieuMuon}/renew-admin`);
		return res.data;
	}
}

export default new BorrowService();
