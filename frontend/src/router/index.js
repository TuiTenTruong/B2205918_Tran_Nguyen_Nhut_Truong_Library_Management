import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import LibraryCatalog from "@/views/user/LibraryCatalog.vue";
import AuthPage from "@/views/user/AuthPage.vue";
import FavoriteBooks from "@/views/user/FavoriteBooks.vue";
import BorrowHistory from "@/views/user/BorrowHistory.vue";
import MyReservations from "@/views/user/MyReservations.vue";
import Profile from "@/views/user/Profile.vue";

import AdminLogin from "@/views/admin/AdminLogin.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminDashboard from "@/views/admin/AdminDashboard.vue";
import AdminBorrows from "@/views/admin/AdminBorrows.vue";
import AdminReservations from "@/views/admin/AdminReservations.vue";
import AdminBooks from "@/views/admin/AdminBooks.vue";
import AdminPublishers from "@/views/admin/AdminPublishers.vue";
import AdminUsers from "@/views/admin/AdminUsers.vue";
import AdminFines from "@/views/admin/AdminFines.vue";
import BookDetail from "@/views/user/BookDetail.vue";
import NotFound from "@/views/NotFound.vue";

const routes = [
	// --------- USER ----------
	{
		path: "/",
		component: MainLayout,
		children: [
			{
				path: "",
				name: "catalog",
				component: LibraryCatalog,
			},
			{
				path: "books/:id",
				name: "book-detail",
				component: BookDetail,
			},
			{
				path: "favorites",
				name: "favorites",
				component: FavoriteBooks,
				meta: { requiresAuth: true },
			},
			{
				path: "history",
				name: "history",
				component: BorrowHistory,
				meta: { requiresAuth: true },
			},
			{
				path: "reservations",
				name: "reservations",
				component: MyReservations,
				meta: { requiresAuth: true },
			},
			{
				path: "profile",
				name: "profile",
				component: Profile,
				meta: { requiresAuth: true },
			},
		],
	},

	{
		path: "/auth",
		name: "auth",
		component: AuthPage,
	},

	// --------- ADMIN ----------
	// Trang login admin (URL ẩn)
	{
		path: "/library-admin-9f82kfj",
		name: "admin-login",
		component: AdminLogin,
		meta: { isAdminLogin: true },
	},

	// Khu admin dùng layout riêng
	{
		path: "/library-admin-9f82kfj/app",
		component: AdminLayout,
		meta: { requiresAdmin: true },
		children: [
			{
				path: "",
				name: "admin-dashboard",
				component: AdminDashboard,
				meta: {
					adminTitle: "Trang chủ",
					adminSubtitle: "Tổng quan hoạt động thư viện",
				},
			},
			{
				path: "borrows",
				name: "admin-borrows",
				component: AdminBorrows,
				meta: {
					adminTitle: "Quản lý mượn sách",
					adminSubtitle: "Tạo và quản lý các phiếu mượn",
				},
			},
			{
				path: "reservations",
				name: "admin-reservations",
				component: AdminReservations,
				meta: {
					adminTitle: "Quản lý đặt trước",
					adminSubtitle:
						"Quản lý đặt trước sách và xử lý việc nhận sách",
				},
			},
			{
				path: "books",
				name: "admin-books",
				component: AdminBooks,
				meta: {
					adminTitle: "Quản lý sách",
					adminSubtitle: "Tạo và quản lý các sách trong thư viện",
				},
			},
			{
				path: "publishers",
				name: "admin-publishers",
				component: AdminPublishers,
				meta: {
					adminTitle: "Quản lý nhà xuất bản",
					adminSubtitle:
						"Tạo và quản lý các nhà xuất bản trong thư viện",
				},
			},
			{
				path: "readers",
				name: "admin-readers",
				component: AdminUsers,
				meta: {
					adminTitle: "Quản lý độc giả",
					adminSubtitle: "Tạo và quản lý các độc giả trong thư viện",
				},
			},
			{
				path: "fines",
				name: "admin-fines",
				component: AdminFines,
				meta: {
					adminTitle: "Quản lý phạt",
					adminSubtitle:
						"Tạo và quản lý các khoản phạt trong thư viện",
				},
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		name: "not-found",
		component: NotFound,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// =============== GUARD DUY NHẤT ===============
router.beforeEach((to, from, next) => {
	// ----- ĐỘC GIẢ (reader) -----
	const readerToken = localStorage.getItem("readerToken");
	const isReaderAuthenticated = !!readerToken;

	// Nếu đã đăng nhập reader mà vào /auth -> về catalog
	if (to.name === "auth" && isReaderAuthenticated) {
		return next({ name: "catalog" });
	}

	// Các trang requiresAuth mà chưa login reader -> chuyển về /auth
	if (to.meta.requiresAuth && !isReaderAuthenticated) {
		return next({
			name: "auth",
			query: { redirect: to.fullPath },
		});
	}

	// ----- NHÂN VIÊN / ADMIN -----
	const staffToken = localStorage.getItem("staffToken");
	const isAdmin = !!staffToken; // CHỈ CẦN CÓ TOKEN NHÂN VIÊN LÀ ĐƯỢC

	// Route cần quyền admin
	if (to.meta.requiresAdmin) {
		if (!isAdmin) {
			// chưa login admin -> bắt về login admin ẩn
			return next({ name: "admin-login" });
		}
	}

	// Đã login admin rồi mà vẫn vào trang login admin -> tự chuyển qua dashboard
	if (to.meta.isAdminLogin && isAdmin) {
		return next({ name: "admin-dashboard" });
	}

	// Cho phép tiếp tục
	return next();
});

export default router;
