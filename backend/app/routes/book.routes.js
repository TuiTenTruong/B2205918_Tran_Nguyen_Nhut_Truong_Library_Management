const { Router } = require("express");
const router = Router();

// Placeholder routes to keep the app stable; implement real book routes later
router.get("/", (req, res) => {
	res.status(200).json({ message: "Books endpoint placeholder" });
});

module.exports = router;
