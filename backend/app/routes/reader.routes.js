const express = require("express");
const router = express.Router();

const readerController = require("../controllers/reader.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/register", readerController.registerReader);
router.post("/login", readerController.loginReader);

router.get("/profile", authenticate, readerController.getMyProfile);
router.post("/profile", authenticate, readerController.updateProfile);

router.get("/", authenticate, readerController.getAllReaders);
router.delete("/:id", authenticate, readerController.deleteReader);

module.exports = router;
