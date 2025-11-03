const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const readerRoutes = require("./app/routes/reader.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.use("/readers", readerRoutes);

app.use((req, res, next) => {
	return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
	return res.status(err.statusCode || 500).json({
		message: err.message || "Internal Server Error",
	});
});
module.exports = app;
