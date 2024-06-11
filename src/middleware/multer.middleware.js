const multer = require("multer");
const fs = require("fs");

// Function to ensure directory exists, if not, create it
const ensureDirectoryExistence = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Ensure 'public' directory exists
ensureDirectoryExistence("public");

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationFolder = "public/book-images";
    ensureDirectoryExistence(destinationFolder); // Ensure directory exists
    cb(null, destinationFolder); // Set the destination folder for the files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); // Set the filename
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
