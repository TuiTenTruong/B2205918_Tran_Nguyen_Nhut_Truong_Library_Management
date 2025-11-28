const { Router } = require("express");
const router = Router();
const ReaderController = require("../controllers/reader.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");
//Route công khai
router.post("/register", ReaderController.registerReader);
router.post("/login", ReaderController.loginReader);

router.get("/profile", authenticate, ReaderController.getMyProfile);
router.get("/profile/:id", authenticate, ReaderController.getUserProfile);
router.put("/profile", authenticate, ReaderController.updateProfile);
router.post(
	"/favorite/:bookId",
	authenticate,
	ReaderController.toggleFavoriteBook
);
router.post("/save/:bookId", authenticate, ReaderController.toggleSavedBook);
//Route chỉ dành cho admin
router.get("/", authenticate, isAdmin, ReaderController.getAllReaders);
router.delete("/:id", authenticate, isAdmin, ReaderController.deleteReader);

module.exports = router;
