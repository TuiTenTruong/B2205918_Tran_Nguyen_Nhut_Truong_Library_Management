const multer = require("multer");
const path = require("path");

const generateFileName = (originalName) => {
	const timestamp = Date.now();
	const ext = path.extname(originalName);
	return `${timestamp}${ext}`;
};

const createUploader = (subFolder) => {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			// Đường dẫn đến thư mục public/uploads từ thư mục middleware
			cb(null, path.join(__dirname, `../../public/uploads/${subFolder}`));
		},
		filename: function (req, file, cb) {
			cb(null, generateFileName(file.originalname));
		},
	});

	return multer({ storage: storage });
};

module.exports = createUploader;
