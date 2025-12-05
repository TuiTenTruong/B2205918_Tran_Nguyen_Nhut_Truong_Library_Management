import createApiClient from "./api.service";
import adminApi from "./adminApi.service";

class ReservationService {
	constructor(baseUrl = "/api/reservations") {
		this.api = createApiClient(baseUrl);
	}
	// Đặt trước sách
	async createReservation(maSach) {
		const response = await this.api.post("/", { MaSach: maSach });
		return response.data;
	}

	// Lấy danh sách đặt trước của tôi
	async getMyReservations() {
		const response = await this.api.get("/my");
		return response.data;
	}

	// Lấy chi tiết đặt trước
	async getReservationById(maDatTruoc) {
		const response = await this.api.get(`/${maDatTruoc}`);
		return response.data;
	}

	// Kiểm tra vị trí hàng đợi của sách
	async getQueuePosition(maSach) {
		const response = await this.api.get(`/queue/book/${maSach}`);
		return response.data;
	}

	// Hủy đặt trước
	async cancelReservation(maDatTruoc) {
		const response = await this.api.delete(`/${maDatTruoc}`);
		return response.data;
	}

	// Lấy tất cả đặt trước
	async getAllReservationsAdmin(filters = {}) {
		const params = new URLSearchParams();
		if (filters.TrangThai) params.append("TrangThai", filters.TrangThai);
		if (filters.MaSach) params.append("MaSach", filters.MaSach);

		const response = await adminApi.get(
			`/reservations/admin/all?${params.toString()}`
		);
		return response.data;
	}

	// Lấy thống kê đặt trước
	async getReservationStatistics() {
		const response = await adminApi.get("/reservations/admin/statistics");
		return response.data;
	}

	// Lấy hàng đợi của một sách
	async getQueueByBookAdmin(maSach) {
		const response = await adminApi.get(
			`/reservations/admin/book/${maSach}/queue`
		);
		return response.data;
	}

	// Hoàn tất đặt trước (khi user đến mượn)
	async completeReservation(maDatTruoc, ngayTra = null) {
		const payload = ngayTra ? { NgayTra: ngayTra } : {};
		const response = await adminApi.put(
			`/reservations/admin/${maDatTruoc}/complete`,
			payload
		);
		return response.data;
	}

	// Admin hủy đặt trước
	async adminCancelReservation(maDatTruoc) {
		const response = await adminApi.delete(
			`/reservations/admin/${maDatTruoc}`
		);
		return response.data;
	}

	// Xử lý các đơn hết hạn
	async processExpiredReservations() {
		const response = await adminApi.post(
			"/reservations/admin/process-expired"
		);
		return response.data;
	}
}

export default new ReservationService();
