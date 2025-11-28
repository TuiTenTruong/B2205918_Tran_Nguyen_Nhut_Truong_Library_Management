const express = require("express");
const cors = require("cors");
const path = require("path");
const ApiError = require("./app/api-error");
const readerRoutes = require("./app/routes/reader.routes");
const staffRoutes = require("./app/routes/staff.routes");
const bookRoutes = require("./app/routes/book.routes");
const publisherRoutes = require("./app/routes/publisher.routes");
const borrowRoutes = require("./app/routes/borrow.routes");
const app = express();

app.use(cors());
app.use(express.json());
// Serve static files từ thư mục public/uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.use("/api/readers", readerRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/borrows", borrowRoutes);
app.use((req, res, next) => {
	return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
	return res.status(err.statusCode || 500).json({
		message: err.message || "Internal Server Error",
	});
});
module.exports = app;
