const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/book-images'); // Set the destination folder for the files
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname); // Set the filename
    }
  });
  
  const upload = multer({ storage });
  
  const uploadFields = [
    { name: 'bookHeaderImage', maxCount: 1 }, // Single file
    { name: 'bookImages', maxCount: 10 } // Multiple files
  ];
  
  module.exports = upload.fields(uploadFields);
