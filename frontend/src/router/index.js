import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import LibraryCatalog from "@/views/user/LibraryCatalog.vue";
import AuthPage from "@/views/user/AuthPage.vue";
import FavoriteBooks from "@/views/user/FavoriteBooks.vue";
import BorrowHistory from "@/views/user/BorrowHistory.vue";
import Profile from "@/views/user/Profile.vue";

const routes = [
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
				path: "favorites",
				name: "favorites",
				component: FavoriteBooks,
			},
			{
				path: "history",
				name: "history",
				component: BorrowHistory,
			},
			{
				path: "profile",
				name: "profile",
				component: Profile,
			},
		],
	},
	{
		path: "/auth",
		name: "auth",
		component: AuthPage,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
