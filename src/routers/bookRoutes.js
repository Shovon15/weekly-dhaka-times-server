const express = require("express");

const { isLogedIn } = require("../middleware/isLogedIn");
const {
  addBook,
  getBooks,
  getBookPages,
  getBooksForClient,
  getBookPagesForClient,
  updateBookPages,
  deleteBook,
  updateBookTitle,
  addImages,
} = require("../controllers/bookController");
const upload = require("../middleware/multer.middleware");

const bookRouter = express.Router();

bookRouter.get("/magazine", getBooksForClient);
bookRouter.get("/get-books", getBooks); //for admin

bookRouter.post("/add-book", isLogedIn, upload, addBook);
bookRouter.post("/add-image", isLogedIn, upload, addImages);

bookRouter.get("/book-pages", getBookPages); //for admin
bookRouter.post("/update-pages", isLogedIn, updateBookPages); //for admin
bookRouter.post("/update-title", isLogedIn, updateBookTitle); //for admin
bookRouter.get("/magazine-pages", getBookPagesForClient);
bookRouter.get("/magazine-delete", deleteBook);

module.exports = bookRouter;
