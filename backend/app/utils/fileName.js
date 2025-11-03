import { extname } from "path";

function generateFileName(originalName) {
	const timestamp = Date.now();
	const ext = extname(originalName);
	return `${timestamp}${ext}`;
}

export default generateFileName;
