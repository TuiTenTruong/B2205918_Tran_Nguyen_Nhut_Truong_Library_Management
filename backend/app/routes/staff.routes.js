import { Router } from "express";
const router = Router();

import {
	createStaffAccount,
	loginAsStaff,
	getMyProfile,
	getUserProfile,
	updateProfile,
	deleteStaff,
	getAllStaffs,
} from "../controllers/staff.controller";
import { authenticate } from "../middleware/auth.middleware";

import { isAdmin } from "../middleware/admin.middleware";

router.post("/create", createStaffAccount);
router.post("/login", loginAsStaff);

router.get("/profile", authenticate, isAdmin, getMyProfile);
router.get("/profile/:id", authenticate, isAdmin, getUserProfile);
router.put("/profile", authenticate, isAdmin, updateProfile);
router.delete("/:id", authenticate, isAdmin, deleteStaff);

router.get("/", authenticate, isAdmin, getAllStaffs);
export default router;
