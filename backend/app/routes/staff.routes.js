const { Router } = require("express");
const router = Router();
const StaffController = require("../controllers/staff.controller");
const { authenticate } = require("../middleware/auth.middleware");

const { isAdmin } = require("../middleware/admin.middleware");
//Route công khai
router.post("/create", StaffController.createStaffAccount);
router.post("/login", StaffController.loginAsStaff);

//Route chỉ dành cho admin
router.get("/profile", authenticate, isAdmin, StaffController.getMyProfile);
router.get(
	"/profile/:id",
	authenticate,
	isAdmin,
	StaffController.getUserProfile
);
router.put("/profile", authenticate, isAdmin, StaffController.updateProfile);
router.delete("/:id", authenticate, isAdmin, StaffController.deleteStaff);

router.get("/", authenticate, isAdmin, StaffController.getAllStaffs);
module.exports = router;
