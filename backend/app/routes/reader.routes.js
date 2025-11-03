const express = require("express");
const router = express.Router();

const readerController = require("../controllers/reader.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

router.post("/register", readerController.registerReader);
router.post("/login", readerController.loginReader);

router.get("/profile", authenticate, readerController.getMyProfile);
router.get("/profile/:id", authenticate, readerController.getUserProfile);
router.put("/profile", authenticate, readerController.updateProfile);

router.get("/", authenticate, isAdmin, readerController.getAllReaders);
router.delete("/:id", authenticate, isAdmin, readerController.deleteReader);

module.exports = router;
