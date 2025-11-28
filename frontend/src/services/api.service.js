import axios from "axios";

const commonConfig = {
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
};

export default (baseURL) => {
	const instance = axios.create({
		baseURL,
		...commonConfig,
	});

	instance.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem("readerToken");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => Promise.reject(error)
	);

	return instance;
};
