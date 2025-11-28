import { toast } from "vue3-toastify";

export function logoutUser(router) {
	localStorage.removeItem("readerToken");
	localStorage.removeItem("readerInfo");
	toast.success("Đã đăng xuất");
	router.push({ path: "/auth", query: { mode: "login" } });
}
