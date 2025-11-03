import { get } from "mongoose";
import StaffService from "../services/staff.service";
export async function createStaffAccount(req, res) {
	try {
		const result = await StaffService.createStaffAccount(req.body);
		return res.status(201).json({
			success: true,
			message: "Tạo tài khoản nhân viên thành công",
			data: result,
		});
	} catch (error) {
		// Check if the error is a known "conflict" error from the service
		if (error.statusCode === 409) {
			return res
				.status(409)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi tạo tài khoản nhân viên",
			error: error.message,
		});
	}
}
export async function loginAsStaff(req, res) {
	try {
		const result = await StaffService.loginAsStaff(req.body);
		return res.status(200).json({
			success: true,
			message: "Đăng nhập nhân viên thành công",
			data: result,
		});
	} catch (error) {
		// Check if the error is a known "conflict" error from the service
		if (error.statusCode === 409) {
			return res
				.status(409)
				.json({ success: false, message: error.message });
		}
		return res.status(500).json({
			success: false,
			message: "Lỗi đăng nhập nhân viên",
			error: error.message,
		});
	}
}

export async function getMyProfile(req, res) {
	try {
		const userId = req.userId;
		console.log(userId);
		const staff = await StaffService.getStaffById(userId);
		if (!staff) {
			return res
				.status(404)
				.json({ success: false, message: "Nhân viên không tồn tại" });
		}
		return res.status(200).json({ success: true, data: staff });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin nhân viên",
			error: error.message,
		});
	}
}
export async function getUserProfile(req, res) {
	try {
		const userId = req.params.id;
		console.log(userId);
		const staff = await StaffService.getStaffById(userId);
		if (!staff) {
			return res
				.status(404)
				.json({ success: false, message: "Nhân viên không tồn tại" });
		}
		return res.status(200).json({ success: true, data: staff });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi lấy thông tin nhân viên",
			error: error.message,
		});
	}
}
export async function updateProfile(req, res) {
	try {
		const staff = await StaffService.updateStaff(req.userId, req.body);

		res.status(200).json({
			success: true,
			message: "Cập nhật thành công",
			data: staff,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
}
export async function deleteStaff(req, res) {
	try {
		const result = await StaffService.deleteStaff(req.params.id);

		res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
}

export async function getAllStaffs(req, res) {
	try {
		const filters = {
			page: req.query.page,
			limit: req.query.limit,
			search: req.query.search,
		};

		const result = await StaffService.getAllStaffs(filters);

		res.status(200).json({
			success: true,
			data: result.staffs,
			pagination: result.pagination,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}
