import { Router } from "express";
const router = Router();

import {
	registerReader,
	loginReader,
	getMyProfile,
	getUserProfile,
	updateProfile,
	getAllReaders,
	deleteReader,
} from "../controllers/reader.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

router.post("/register", registerReader);
router.post("/login", loginReader);

router.get("/profile", authenticate, getMyProfile);
router.get("/profile/:id", authenticate, getUserProfile);
router.put("/profile", authenticate, updateProfile);

router.get("/", authenticate, isAdmin, getAllReaders);
router.delete("/:id", authenticate, isAdmin, deleteReader);

export default router;
