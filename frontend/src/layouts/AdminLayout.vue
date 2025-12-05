<template>
	<div class="admin-layout d-flex">
		<!-- SIDEBAR -->
		<aside class="admin-sidebar d-none d-md-flex flex-column">
			<div class="admin-sidebar__header">
				<div class="h5 fw-semibold mb-0">Quản trị viên</div>
				<div class="text-muted small">Bảng điều khiển</div>
			</div>

			<nav class="nav flex-column gap-1 admin-sidebar__nav">
				<RouterLink
					to="/library-admin-9f82kfj/app"
					class="admin-nav-link"
					exact-active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-gauge-high me-2"></i>
					Tổng quan
				</RouterLink>
				<RouterLink
					to="/library-admin-9f82kfj/app/borrows"
					class="admin-nav-link"
					active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-book-open-reader me-2"></i>
					Mượn sách
				</RouterLink>
				<RouterLink
					to="/library-admin-9f82kfj/app/reservations"
					class="admin-nav-link"
					active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-clock-rotate-left me-2"></i>
					Đặt trước
				</RouterLink>
				<RouterLink
					to="/library-admin-9f82kfj/app/books"
					class="admin-nav-link"
					active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-book-open-reader me-2"></i>
					Sách
				</RouterLink>
				<RouterLink
					to="/library-admin-9f82kfj/app/publishers"
					class="admin-nav-link"
					active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-book-open-reader me-2"></i>
					Nhà xuất bản
				</RouterLink>
				<RouterLink
					to="/library-admin-9f82kfj/app/readers"
					class="admin-nav-link"
					active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-book-open-reader me-2"></i>
					Độc giả
				</RouterLink>
				<RouterLink
					to="/library-admin-9f82kfj/app/fines"
					class="admin-nav-link"
					active-class="admin-nav-link--active"
				>
					<i class="fa-solid fa-coins me-2"></i>
					Tiền phạt
				</RouterLink>
			</nav>

			<div class="admin-sidebar__footer mt-auto small">
				<div class="mb-2">
					<div class="fw-semibold">
						{{ adminName || "Quản trị viên" }}
					</div>
					<div class="text-muted">
						{{ adminRole || "Quản lý" }}
					</div>
				</div>
				<button
					class="btn btn-outline-light btn-sm w-100 rounded-pill"
					@click="handleLogout"
				>
					<i class="fa-solid fa-arrow-right-from-bracket me-1"></i>
					Đăng xuất
				</button>
			</div>
		</aside>

		<!-- MAIN AREA -->
		<div class="admin-main flex-grow-1 d-flex flex-column">
			<header
				class="admin-header d-flex align-items-center justify-content-between border-bottom bg-white px-3 py-2"
			>
				<div>
					<div class="fw-semibold">
						{{ $route.meta.adminTitle || "Bảng điều khiển" }}
					</div>
					<div class="text-muted small">
						{{ subtitle }}
					</div>
				</div>

				<div class="d-flex align-items-center gap-3">
					<!-- Notification dropdown -->
					<AdminNotificationDropdown />

					<!-- trên mobile có thể show nút logout nhanh -->
					<button
						class="btn btn-outline-secondary btn-sm d-md-none"
						@click="handleLogout"
					>
						<i class="fa-solid fa-arrow-right-from-bracket"></i>
					</button>
				</div>
			</header>

			<main class="admin-content flex-grow-1 p-3">
				<router-view />
			</main>
		</div>
	</div>
</template>

<script>
import AdminNotificationDropdown from "@/components/AdminNotificationDropdown.vue";

export default {
	name: "AdminLayout",
	components: {
		AdminNotificationDropdown,
	},
	data() {
		return {
			adminName: "",
			adminRole: "",
		};
	},
	computed: {
		subtitle() {
			if (this.$route.meta.adminSubtitle) {
				return this.$route.meta.adminSubtitle;
			}
			if (this.$route.name === "admin-dashboard") {
				return "Tổng quan hoạt động thư viện";
			}
			return "";
		},
	},
	created() {
		const raw = localStorage.getItem("staffInfo");
		if (raw) {
			try {
				const info = JSON.parse(raw);
				this.adminName = info?.HoTen || "Quản trị viên";
				this.adminRole = info?.VaiTro || "Quản lý";
			} catch (e) {
				this.adminName = "Quản trị viên";
				this.adminRole = "Quản lý";
			}
		}
	},
	methods: {
		handleLogout() {
			localStorage.removeItem("staffToken");
			localStorage.removeItem("staffInfo");
			this.$router.push({ name: "admin-login" });
		},
	},
};
</script>

<style scoped>
.admin-layout {
	min-height: 100vh;
	background-color: #f5f7fb;
}

/* SIDEBAR */
.admin-sidebar {
	width: 260px;
	min-width: 260px;
	flex-shrink: 0;
	background-color: #111827;
	color: #e5e7eb;
	padding: 16px 14px;
	position: sticky;
	top: 0;
	height: 100vh;
	max-height: 100vh;
	overflow-y: auto;
}

.admin-sidebar__header {
	margin-bottom: 20px;
}

.admin-sidebar__nav {
	margin-top: 8px;
}

.admin-nav-link {
	color: #e5e7eb;
	border-radius: 999px;
	padding: 0.5rem 0.85rem;
	font-size: 0.9rem;
}
.admin-nav-link:hover {
	background-color: #1f2937;
	color: #ffffff;
	text-decoration: none;
}

.admin-nav-link--active {
	background-color: #eef2ff;
	color: #1d4ed8;
	font-weight: 600;
}

.admin-sidebar__footer {
	border-top: 1px solid rgba(55, 65, 81, 0.8);
	padding-top: 10px;
}

/* MAIN */
.admin-main {
	min-width: 0;
	flex: 1;
	overflow-x: hidden;
}

.admin-header {
	min-height: 52px;
}

.admin-content {
	min-height: 0;
}
</style>
