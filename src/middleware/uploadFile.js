const multer = require("multer");
const path = require("path");
const { MAX_UPLOAD_FILE, ALLOWED_FILE_TYPE } = require("../config/config");

const createError = require("http-errors");

const upload_dir = "public/images";

const storage = multer.diskStorage({
	//where to save-----------------
	destination: function (req, file, cb) {
		cb(null, upload_dir);
	},

	//what is the file name-----------------
	filename: function (req, file, cb) {
		console.log(file, "file");
		const extname = path.extname(file.originalname);

		cb(null, Date.now() + "_" + file.originalname);
		// cb(null, Date.now() + "_" + file.originalname.replace(extname, "") + extname);
	},
	path: function (req, file, cb) {
		const extname = path.extname(file.originalname);
		cb(null, extname);
	},
});
const fileFilter = (req, file, cb) => {
	const extname = path.extname(file.originalname);
	if (!ALLOWED_FILE_TYPE.includes(extname.substring(1))) {
		return cb(createError(400, "File type not allowed"));
	}
	cb(null, true);
};

const upload = multer({
	storage: storage,
	limits: { fileSize: MAX_UPLOAD_FILE },
	fileFilter: fileFilter,
});

module.exports = upload;
