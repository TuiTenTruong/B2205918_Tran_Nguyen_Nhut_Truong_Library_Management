const { Router } = require("express");
const router = Router();
const publisherController = require("../controllers/publisher.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

// Routes công khai
router.get("/", publisherController.getAllPublishers);
router.get("/search", publisherController.searchPublishers);
router.get("/:id", publisherController.getPublisherById);
router.get("/:id/stats", publisherController.getPublisherStats);

// Routes yêu cầu xác thực admin
router.post("/", authenticate, isAdmin, publisherController.createPublisher);
router.put("/:id", authenticate, isAdmin, publisherController.updatePublisher);
router.delete(
	"/:id",
	authenticate,
	isAdmin,
	publisherController.deletePublisher
);

module.exports = router;
