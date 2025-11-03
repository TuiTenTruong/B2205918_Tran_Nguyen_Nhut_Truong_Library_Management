const express = require("express");
const router = express.Router();

const staffController = require("../controllers/staff.controller");
const { authenticate } = require("../middleware/auth.middleware");

const { isAdmin } = require("../middleware/admin.middleware");

router.post("/create", staffController.createStaffAccount);
router.post("/login", staffController.loginAsStaff);

router.get("/profile", authenticate, isAdmin, staffController.getMyProfile);
router.get(
	"/profile/:id",
	authenticate,
	isAdmin,
	staffController.getUserProfile
);
router.put("/profile", authenticate, isAdmin, staffController.updateProfile);
router.delete("/:id", authenticate, isAdmin, staffController.deleteStaff);

router.get("/", authenticate, isAdmin, staffController.getAllStaffs);
module.exports = router;
