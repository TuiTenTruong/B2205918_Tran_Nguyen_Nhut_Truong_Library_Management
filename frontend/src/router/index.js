import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import LibraryCatalog from "@/views/user/LibraryCatalog.vue";
import AuthPage from "@/views/user/AuthPage.vue";
import FavoriteBooks from "@/views/user/FavoriteBooks.vue";

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
