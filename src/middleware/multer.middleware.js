const multer = require("multer");
const fs = require("fs");
const path = require('path');

// Function to ensure directory exists, if not, create it
const ensureDirectoryExistence = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const uploadsDir = path.join('public/book-images');
ensureDirectoryExistence(uploadsDir);

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Set the destination folder for the files
  },
  // filename: function (req, file, cb) {
  //   // cb(null, Date.now() + "_" + file.originalname); // Set the filename
  //   const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
  //   cb(null, Date.now() + "_" + sanitizedFilename); // Set the filename
  // },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, Date.now() + "_" + sanitizedBasename + extension); // Set the filename with extension
  },
});

// Multer configuration
const upload = multer({ storage });

const uploadFields = [
  { name: "bookHeaderImage", maxCount: 1 }, // Single file
  { name: "bookImages", maxCount: 10 }, // Multiple files
];

module.exports = upload.fields(uploadFields);

// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'public/book-images'); // Set the destination folder for the files
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '_' + file.originalname); // Set the filename
//     }
//   });

//   const upload = multer({ storage });

//   const uploadFields = [
//     { name: 'bookHeaderImage', maxCount: 1 }, // Single file
//     { name: 'bookImages', maxCount: 10 } // Multiple files
//   ];

//   module.exports = upload.fields(uploadFields);
