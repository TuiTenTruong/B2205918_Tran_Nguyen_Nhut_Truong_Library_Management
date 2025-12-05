const { Router } = require("express");
const router = Router();
const reservationController = require("../controllers/reservation.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

router.post("/", authenticate, reservationController.createReservation);

router.get("/my", authenticate, reservationController.getMyReservations);

router.get("/:id", authenticate, reservationController.getReservationById);

router.get(
	"/queue/book/:MaSach",
	authenticate,
	reservationController.getQueuePosition
);

router.delete("/:id", authenticate, reservationController.cancelReservation);

router.get(
	"/admin/all",
	authenticate,
	isAdmin,
	reservationController.getAllReservations
);

router.get(
	"/admin/statistics",
	authenticate,
	isAdmin,
	reservationController.getReservationStatistics
);

router.get(
	"/admin/book/:MaSach/queue",
	authenticate,
	isAdmin,
	reservationController.getQueueByBook
);

router.put(
	"/admin/:id/complete",
	authenticate,
	isAdmin,
	reservationController.completeReservation
);

router.delete(
	"/admin/:id",
	authenticate,
	isAdmin,
	reservationController.adminCancelReservation
);

router.post(
	"/admin/process-expired",
	authenticate,
	isAdmin,
	reservationController.processExpiredReservations
);

module.exports = router;
