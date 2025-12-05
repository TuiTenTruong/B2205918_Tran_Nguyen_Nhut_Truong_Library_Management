import axios from "axios";

const adminApi = axios.create({
	baseURL: "/api",
	headers: {
		Accept: "application/json",
	},
});

adminApi.interceptors.request.use((config) => {
	// Thêm token nhân viên vào header
	const token = localStorage.getItem("staffToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	if (config.data instanceof FormData) {
		delete config.headers["Content-Type"];
	} else {
		config.headers["Content-Type"] = "application/json";
	}

	return config;
});

export default adminApi;
