import { verify } from "jsonwebtoken";

export function authenticate(req, res, next) {
	try {
		// Lấy token từ header
		const token = req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Vui lòng đăng nhập",
			});
		}

		// Verify token
		const decoded = verify(token, process.env.JWT_SECRET);
		req.userId = decoded.id;
		req.userEmail = decoded.email;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Token không hợp lệ hoặc đã hết hạn",
		});
	}
}
