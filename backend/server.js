const dotenv = require("dotenv");
const app = require("./app");
const config = require("./app/config");
const connectDB = require("./app/config/database");

dotenv.config();

async function startServer() {
	try {
		await connectDB();

		const PORT = config.app.port;
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}.`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
	}
}

startServer();
