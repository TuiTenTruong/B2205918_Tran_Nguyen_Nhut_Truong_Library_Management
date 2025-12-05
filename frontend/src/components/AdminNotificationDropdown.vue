<template>
	<div class="notification-dropdown" ref="dropdown">
		<button
			class="btn btn-link position-relative p-0 text-secondary"
			@click="toggleDropdown"
			type="button"
		>
			<i class="fa-regular fa-bell fa-lg"></i>
			<span
				v-if="unreadCount > 0"
				class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
				style="font-size: 0.65rem"
			>
				{{ unreadCount > 99 ? "99+" : unreadCount }}
			</span>
		</button>

		<div
			v-if="isOpen"
			class="dropdown-menu dropdown-menu-end show notification-menu shadow"
		>
			<div
				class="dropdown-header d-flex justify-content-between align-items-center"
			>
				<span class="fw-semibold">Thông báo Admin</span>
				<div class="d-flex gap-2">
					<button
						class="btn btn-link btn-sm text-secondary p-0"
						@click="handleRefresh"
						title="Kiểm tra thông báo mới"
					>
						<i class="fa-solid fa-rotate"></i>
					</button>
					<button
						v-if="notifications.length > 0 && unreadCount > 0"
						class="btn btn-link btn-sm text-primary p-0"
						@click="handleMarkAllAsRead"
					>
						Đánh dấu tất cả
					</button>
				</div>
			</div>

			<div class="notification-list">
				<div v-if="loading" class="text-center py-3">
					<div class="spinner-border spinner-border-sm" role="status">
						<span class="visually-hidden">Đang tải...</span>
					</div>
				</div>
				<div
					v-else-if="notifications.length === 0"
					class="text-center text-muted py-4"
				>
					<i class="fa-regular fa-bell-slash fa-2x mb-2"></i>
					<p class="mb-0 small">Không có thông báo mới</p>
				</div>

				<div v-else>
					<div
						v-for="notification in notifications"
						:key="notification.MaThongBao"
						class="notification-item"
						:class="{ 'notification-unread': !notification.DaDoc }"
						@click="handleNotificationClick(notification)"
					>
						<div class="d-flex align-items-start gap-2">
							<div
								class="notification-icon"
								:class="getIconClass(notification.LoaiThongBao)"
							>
								<i
									:class="getIcon(notification.LoaiThongBao)"
								></i>
							</div>
							<div class="flex-grow-1 min-width-0">
								<div class="fw-semibold small text-truncate">
									{{ notification.TieuDe }}
								</div>
								<div
									class="text-muted small notification-content"
									:class="{
										'notification-content-expanded': isExpanded(
											notification.MaThongBao
										),
									}"
								>
									{{ notification.NoiDung }}
								</div>
								<div
									class="d-flex justify-content-between align-items-center mt-1"
								>
									<span class="text-muted small">
										{{ formatTime(notification.createdAt) }}
									</span>
									<span
										v-if="
											notification.LoaiThongBao ===
											'mat_sach'
										"
										class="badge bg-danger"
									>
										Cần xử lý
									</span>
								</div>
							</div>
							<button
								class="btn btn-link btn-sm p-0 text-muted"
								@click.stop="
									handleDelete(notification.MaThongBao)
								"
								title="Xóa thông báo"
							>
								<i class="fa-solid fa-xmark"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import adminNotificationService from "@/services/adminNotification.service";

export default {
	name: "AdminNotificationDropdown",
	data() {
		return {
			isOpen: false,
			loading: false,
			notifications: [],
			unreadCount: 0,
			pollingInterval: null,
			expandedNotifications: new Set(),
		};
	},
	methods: {
		toggleDropdown() {
			this.isOpen = !this.isOpen;
			if (this.isOpen) {
				this.fetchNotifications();
			}
		},
		async fetchNotifications() {
			this.loading = true;
			try {
				const [notifRes, countRes] = await Promise.all([
					adminNotificationService.getAdminNotifications(false),
					adminNotificationService.getAdminUnreadCount(),
				]);
				this.notifications = notifRes.data || [];
				this.unreadCount = countRes.data?.unreadCount || 0;
			} catch (error) {
				console.error("Error fetching admin notifications:", error);
			} finally {
				this.loading = false;
			}
		},
		async fetchUnreadCount() {
			try {
				const res =
					await adminNotificationService.getAdminUnreadCount();
				this.unreadCount = res.data?.unreadCount || 0;
			} catch (error) {
				console.error("Error fetching admin unread count:", error);
			}
		},
		async handleRefresh() {
			this.loading = true;
			try {
				await adminNotificationService.runNotificationChecks();
				await this.fetchNotifications();
			} catch (error) {
				console.error("Error running notification checks:", error);
			} finally {
				this.loading = false;
			}
		},
		async handleNotificationClick(notification) {
			// Toggle expand/collapse
			if (this.expandedNotifications.has(notification.MaThongBao)) {
				this.expandedNotifications.delete(notification.MaThongBao);
			} else {
				this.expandedNotifications.add(notification.MaThongBao);
			}

			// Đánh dấu đã đọc nếu chưa đọc
			if (!notification.DaDoc) {
				try {
					await adminNotificationService.markAsRead(
						notification.MaThongBao
					);
					notification.DaDoc = true;
					this.unreadCount = Math.max(0, this.unreadCount - 1);
				} catch (error) {
					console.error("Error marking notification as read:", error);
				}
			}
		},
		async handleMarkAllAsRead() {
			try {
				await adminNotificationService.markAllAsRead();
				this.notifications.forEach((n) => (n.DaDoc = true));
				this.unreadCount = 0;
			} catch (error) {
				console.error("Error marking all as read:", error);
			}
		},
		async handleDelete(MaThongBao) {
			try {
				await adminNotificationService.deleteNotification(MaThongBao);
				const index = this.notifications.findIndex(
					(n) => n.MaThongBao === MaThongBao
				);
				if (index !== -1) {
					if (!this.notifications[index].DaDoc) {
						this.unreadCount = Math.max(0, this.unreadCount - 1);
					}
					this.notifications.splice(index, 1);
				}
			} catch (error) {
				console.error("Error deleting notification:", error);
			}
		},
		getIcon(type) {
			const icons = {
				mat_sach: "fa-solid fa-triangle-exclamation",
			};
			return icons[type] || "fa-solid fa-bell";
		},
		getIconClass(type) {
			const classes = {
				mat_sach: "bg-danger text-white",
			};
			return classes[type] || "bg-primary text-white";
		},
		isExpanded(MaThongBao) {
			return this.expandedNotifications.has(MaThongBao);
		},
		formatTime(dateStr) {
			const date = new Date(dateStr);
			const now = new Date();
			const diffMs = now - date;
			const diffMins = Math.floor(diffMs / (1000 * 60));
			const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
			const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

			if (diffMins < 1) return "Vừa xong";
			if (diffMins < 60) return `${diffMins} phút trước`;
			if (diffHours < 24) return `${diffHours} giờ trước`;
			if (diffDays < 7) return `${diffDays} ngày trước`;
			return date.toLocaleDateString("vi-VN");
		},
		handleClickOutside(event) {
			if (
				this.$refs.dropdown &&
				!this.$refs.dropdown.contains(event.target)
			) {
				this.isOpen = false;
			}
		},
	},
	mounted() {
		this.fetchUnreadCount();
		this.pollingInterval = setInterval(() => {
			this.fetchUnreadCount();
		}, 60000);
		document.addEventListener("click", this.handleClickOutside);
	},
	unmounted() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
		}
		document.removeEventListener("click", this.handleClickOutside);
	},
};
</script>

<style scoped>
.notification-dropdown {
	position: relative;
}

.notification-menu {
	position: absolute;
	top: 100%;
	right: 0;
	width: 400px;
	max-width: 90vw;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	background: white;
	z-index: 1060;
}

.dropdown-header {
	padding: 12px 16px;
	border-bottom: 1px solid #e5e7eb;
}

.notification-list {
	max-height: 450px;
	overflow-y: auto;
}

.notification-item {
	padding: 12px 16px;
	border-bottom: 1px solid #f3f4f6;
	cursor: pointer;
	transition: background-color 0.15s;
}

.notification-item:hover {
	background-color: #f9fafb;
}

.notification-item:last-child {
	border-bottom: none;
}

.notification-unread {
	background-color: #fef2f2;
}

.notification-unread:hover {
	background-color: #fee2e2;
}

.notification-icon {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	font-size: 0.9rem;
}

.notification-content {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	transition: all 0.3s ease;
}

.notification-content-expanded {
	display: block;
	-webkit-line-clamp: unset;
	white-space: normal;
}

.min-width-0 {
	min-width: 0;
}
</style>
