import { connect } from "mongoose";
import { db } from "./index";

const connectDB = async () => {
	try {
		await connect(db.uri);
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

export default connectDB;
