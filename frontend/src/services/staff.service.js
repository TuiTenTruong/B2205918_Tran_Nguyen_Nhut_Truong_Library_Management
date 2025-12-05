import createApiClient from "./api.service";
import adminApi from "./adminApi.service";

class StaffService {
	constructor(baseUrl = "/api/staffs") {
		this.api = createApiClient(baseUrl);
	}

	async login(credentials) {
		return (await this.api.post("/login", credentials)).data;
	}

	async createStaffAccount(data) {
		const res = await adminApi.post("/staffs/create", data);
		return res.data;
	}

	// Hàm admin lấy danh sách nhân viên
	async getAllStaffs(params) {
		const res = await adminApi.get("/staffs", { params });
		return res.data;
	}

	// Hàm admin xóa 1 nhân viên
	async deleteStaff(id) {
		const res = await adminApi.delete(`/staffs/${id}`);
		return res.data;
	}
}

export default new StaffService();
