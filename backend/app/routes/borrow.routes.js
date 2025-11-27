const { Router } = require("express");
const router = Router();
const borrowController = require("../controllers/borrow.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

// Routes công khai (có thể xem)
router.get("/", authenticate, borrowController.getAllBorrows);
router.get("/statistics", authenticate, isAdmin, borrowController.getBorrowStatistics);
router.get("/overdue", authenticate, isAdmin, borrowController.getOverdueBorrows);
router.get("/:id", authenticate, borrowController.getBorrowById);
router.get("/reader/:readerId", authenticate, borrowController.getBorrowsByReader);
router.get("/book/:bookId", authenticate, borrowController.getBorrowsByBook);

// Routes yêu cầu xác thực admin
router.post("/", authenticate, isAdmin, borrowController.createBorrow);
router.put("/:id/return", authenticate, isAdmin, borrowController.returnBook);
router.put("/:id", authenticate, isAdmin, borrowController.updateBorrow);
router.delete("/:id", authenticate, isAdmin, borrowController.deleteBorrow);

module.exports = router;
