const { Router } = require("express");
const router = Router();
const bookController = require("../controllers/book.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");
const createUploader = require("../middleware/uploadFile");

// Tạo uploader cho thư mục books
const uploadBookCover = createUploader("books");

// Routes công khai

router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/:id", bookController.getBookById);

// Routes yêu cầu xác thực admin
router.post(
	"/",
	authenticate,
	isAdmin,
	uploadBookCover.single("AnhBia"),
	bookController.createBook
);

router.put(
	"/:id",
	authenticate,
	isAdmin,
	uploadBookCover.single("AnhBia"),
	bookController.updateBook
);

router.delete("/:id", authenticate, isAdmin, bookController.deleteBook);

router.post(
	"/delete-multiple",
	authenticate,
	isAdmin,
	bookController.deleteMultipleBooks
);

module.exports = router;
