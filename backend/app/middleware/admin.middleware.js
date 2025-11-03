import NhanVien from "../models/staff.model";

export async function isAdmin(req, res, next) {
	try {
		const staff = await NhanVien.findOne({
			MSNV: req.userId,
			DaXoa: false,
		});
		if (!staff) {
			return res.status(404).json({
				success: false,
				message: "Nhân viên không tồn tại",
			});
		}

		if (staff.ChucVu !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Bạn không có quyền truy cập",
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi server",
			error: error.message,
		});
	}
}
