import multer, { diskStorage } from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import generateFileName from "../utils/fileName.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createUploader = (subFolder) => {
	const storage = diskStorage({
		destination: function (req, file, cb) {
			// Đường dẫn đến thư mục public/uploads từ thư mục gốc của project
			cb(null, join(__dirname, `../../../public/uploads/${subFolder}`));
		},
		filename: function (req, file, cb) {
			cb(null, generateFileName(file.originalname));
		},
	});

	return multer({ storage: storage });
};

export default createUploader;
