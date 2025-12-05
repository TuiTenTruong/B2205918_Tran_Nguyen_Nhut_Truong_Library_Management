import adminApi from "./adminApi.service";

class AdminNotificationService {
	async getAdminNotifications(includeRead = false) {
		return (
			await adminApi.get(
				`/notifications/admin?includeRead=${includeRead}`
			)
		).data;
	}

	async getAdminUnreadCount() {
		return (await adminApi.get("/notifications/admin/unread-count")).data;
	}

	async markAsRead(id) {
		return (await adminApi.put(`/notifications/admin/${id}/read`)).data;
	}

	async markAllAsRead() {
		return (await adminApi.put("/notifications/admin/read-all")).data;
	}

	async deleteNotification(id) {
		return (await adminApi.delete(`/notifications/admin/${id}`)).data;
	}

	async runNotificationChecks() {
		return (await adminApi.post("/notifications/check")).data;
	}
}

export default new AdminNotificationService();
