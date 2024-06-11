const path = require('path');
const fs = require("fs");
const removeImages = async (book) => {
    if (!book || !book.bookImages || !Array.isArray(book.bookImages)) {
      return;
    }
  
    try {
      for (const imagePath of book.bookImages) {
        // const absolutePath = path.join(__dirname, '..', 'public', 'book-images', imagePath);
        const absolutePath = path.join("public", "book-images", imagePath);
        console.log(absolutePath,"absolutePath")
        fs.unlinkSync(absolutePath);
        console.log(`Deleted image: ${imagePath}`);
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      throw error;
    }
  };
  
  module.exports = removeImages;