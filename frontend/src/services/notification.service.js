import createApiClient from "./api.service";

class NotificationService {
	constructor(baseUrl = "http://localhost:3000/api/notifications") {
		this.api = createApiClient(baseUrl);
	}

	// Lấy thông báo của user hiện tại
	async getMyNotifications(includeRead = false) {
		return (await this.api.get(`/my?includeRead=${includeRead}`)).data;
	}

	// Lấy số thông báo chưa đọc
	async getMyUnreadCount() {
		return (await this.api.get("/my/unread-count")).data;
	}

	// Đánh dấu đã đọc một thông báo
	async markAsRead(id) {
		return (await this.api.put(`/my/${id}/read`)).data;
	}

	// Đánh dấu tất cả đã đọc
	async markAllAsRead() {
		return (await this.api.put("/my/read-all")).data;
	}

	// Xóa thông báo
	async deleteNotification(id) {
		return (await this.api.delete(`/my/${id}`)).data;
	}
}

export default new NotificationService();
