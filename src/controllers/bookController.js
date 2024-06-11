const BookModel = require("../models/bookModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { successResponse, errorResponse } = require("./responseController");
const findWithSlug = require("../services/findWithSlug");
const removeImages = require("../services/removeImages");

const addBook = async (req, res, next) => {
  try {
    const { bookName } = req.body;
    const bookHeaderImage = req.files["bookHeaderImage"]
      ? req.files["bookHeaderImage"][0].filename
      : null;
    const bookImages = req.files["bookImages"]
      ? req.files["bookImages"].map((file) => file.filename)
      : null;

    // console.log(bookHeaderImage, bookImages, "...........");

    if (!bookName) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Magazin name is required",
      });
    }
    // console.log(bookHeaderImage,"bookHeaderImage")

    if (!bookHeaderImage || bookImages?.length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: "At least one Magazin image is required",
      });
    }

    await BookModel.create({
      bookName,
      bookHeaderImage,
      bookImages: bookImages,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "New Magazin Created Successfully.",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const data = await BookModel.find({}).limit(limit).skip(skip);
    const count = await BookModel.find({}).countDocuments();

    return successResponse(res, {
      statusCode: 200,
      message: "Get Magazin Successfully!!!",
      payload: {
        data,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// const getBooksForClient = async (req, res, next) => {

//     try {
//         // const data = await BookModel.find({});
//         const data = await BookModel.find({}, 'bookName bookHeaderImage slug');

//         const count = await BookModel.find({}).countDocuments();

//         // Fetch images from book data and create an array of image URLs
//         const imageUrls = data.map(book => book.bookHeaderImage);

//         // Create PDF
//         const pdfDoc = new PDFDocument();
//         const outputPath = 'output.pdf'; // Output PDF file path
//         const writeStream = fs.createWriteStream(outputPath);
//         pdfDoc.pipe(writeStream);

//         for (const imageUrl of imageUrls) {
//             const imageBuffer = await fetchImage(imageUrl);
//             const imageStream = new PDFDocument.Image({ image: imageBuffer });
//             pdfDoc.addPage().image(imageStream, { fit: [pdfDoc.page.width, pdfDoc.page.height] });
//         }

//         pdfDoc.end();

//         // Send response
//         writeStream.on('finish', () => {
//             res.download(outputPath, 'output.pdf', (err) => {
//                 if (err) {
//                     console.error('Error sending file:', err);
//                     res.status(500).send('Error creating PDF');
//                 } else {
//                     console.log('PDF created and sent successfully');
//                 }
//             });
//         });

//         return successResponse(res, {
//             statusCode: 200,
//             message: "Get Magazin Successfully!!!",
//             payload: {
//                 data
//                 // pagination: {
//                 //     totalPages: Math.ceil(count / limit),
//                 //     currentPage: page,
//                 //     previousPage: page - 1 > 0 ? page - 1 : null,
//                 //     nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1: null,
//                 // }
//             },
//         });

//     } catch (error) {
//         next(error);
//     }
// };

const getBooksForClient = async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 8;
  const skip = (page - 1) * limit;

  try {
    // const data = await BookModel.find(
    //     {},
    //     "bookName bookHeaderImage bookImages slug"
    // )
    //     .limit(limit)
    //     .skip(skip);
    //     const count = await BookModel.find({}).countDocuments();

    const result = await BookModel.aggregate([
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                bookName: 1,
                bookHeaderImage: 1,
                bookImages: 1,
                slug: 1,
              },
            },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const books = result[0].data;
    const totalCount = result[0].totalCount[0]
      ? result[0].totalCount[0].count
      : 0;

    const pdfPaths = await Promise.all(
      books.map(async (book) => {
        // Make bookHeaderImage the first element of bookImages
        if (
          Array.isArray(book.bookImages) &&
          typeof book.bookHeaderImage === "string"
        ) {
          book.bookImages.unshift(book.bookHeaderImage);
        }

        // Create a PDF for this book
        const pdfDoc = new PDFDocument();
        const pdfName = `${book.slug}.pdf`;
        const pdfPath = path.join("public", "pdf", pdfName);
        const writeStream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(writeStream);

        const bookImagesLength = book.bookImages.length;

        for (let i = 0; i < bookImagesLength; i++) {
          const image = book.bookImages[i];
          const imagePath = path.join("public", "book-images", image);
          if (fs.existsSync(imagePath)) {
            const { width, height } = pdfDoc.page;

            pdfDoc.image(imagePath, 0, 0, { width, height });

            // Add a new page if it's not the last image
            if (i < bookImagesLength - 1) {
              pdfDoc.addPage();
            }
          } else {
            console.error(`Image not found: ${imagePath}`);
          }
        }

        pdfDoc.end();

        return new Promise((resolve, reject) => {
          writeStream.on("finish", () => {
            const filename = path.basename(pdfPath);
            resolve(filename);
          });
          writeStream.on("error", reject);
        });
      })
    );

    const pdfPathsObject = {};
    books.forEach((book, index) => {
      pdfPathsObject[book.pdfPath] = pdfPaths[index];
    });

    // Combine data and pdfPathsObject
    const dataWithPdf = books.map((book) => ({
      ...book,
      pdfPath: pdfPathsObject[book.pdfPath],
    }));

    //bookName, bookHeaderImage, slug

    return successResponse(res, {
      statusCode: 200,
      message: "Get Magazin Successfully!!!",
      payload: {
        data: dataWithPdf,
        // pdfPaths,
        pagination: {
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(totalCount / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateBookPages = async (req, res, next) => {
  const { slug } = req.query;
  const { orderedValues } = req.body;

  console.log(slug, orderedValues);

  try {
    const filenames = orderedValues.map((url) => {
      const match = url.match(/images\/(.+)$/);
      return match ? match[1] : url;
    });

    const updatedBook = await BookModel.findOneAndUpdate(
      { slug },
      { $set: { bookImages: filenames } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({
        statusCode: 404,
        message: "Book not found",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "magazine update Successfully!!!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  const { slug } = req.query;

  try {
  
    const book = await findWithSlug(BookModel, slug);
    console.log(book,"book")

   
		if (!book) {
			return errorResponse(res, {
        statusCode: 400,
        message: `Magazine not found`,
      });
		}


    if (book) {
      try {
        await removeImages(book);
      } catch (error) {
        console.error('Error removing images:', error);
      }
    } else {
      console.log('Book not found');
    }


	
    await BookModel.findByIdAndDelete(book._id);
  
    return successResponse(res, {
      statusCode: 200,
      message: `Delete Magazine Successfully`,
      payload:{
        book,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBookPages = async (req, res, next) => {
  const { slug } = req.query;

  try {
    const data = await BookModel.find({ slug });

    const book = data[0];

    // if (
    //   Array.isArray(book.bookImages) &&
    //   typeof book.bookHeaderImage === "string"
    // ) {
    //   book.bookImages.unshift(book.bookHeaderImage);
    // }

    return successResponse(res, {
      statusCode: 200,
      message: "Get Magazine Successfully!!!",
      payload: {
        data: book,
      },
    });
  } catch (error) {
    next(error);
  }
};

// const getBookPagesForClient = async (req, res, next) => {

//     const { slug } = req.query;

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     try {
//         const data = await BookModel.find({slug});
// 		// const count = await BookModel.find({}).countDocuments();
//         if (!data.length) {
//             return errorResponse(res, {
//                 statusCode: 400,
//                 message: "Magazin not found",
//             });
//         }

//         const book = data[0];

//         // If bookImages is an array and bookHeaderImage is a string, modify the array
//         if (Array.isArray(book.bookImages) && typeof book.bookHeaderImage === 'string') {
//             book.bookImages.unshift(book.bookHeaderImage);
//         }

//        console.log( book.bookImages," book.bookImages")

//         return successResponse(res, {
//             statusCode: 200,
//             message: "Get Magazin Successfully!!!",
//             payload: {
//                 name:book.bookName,
//                 data: book.bookImages,
//             },
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const getBookPagesForClient = async (req, res, next) => {
  const { slug } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const data = await BookModel.find({ slug });
    if (!data.length) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Magazin not found",
      });
    }

    const book = data[0];

    // If bookImages is an array and bookHeaderImage is a string, modify the array
    if (
      Array.isArray(book.bookImages) &&
      typeof book.bookHeaderImage === "string"
    ) {
      book.bookImages.unshift(book.bookHeaderImage);
    }

    console.log(book.bookImages, " book.bookImages");

    // Create a new PDF document
    const doc = new PDFDocument();
    const pdfName = `${book.slug}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, "public", "pdf", pdfName);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

    // Pipe the PDF document to a file
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add each image to the PDF document
    book.bookImages.forEach((image) => {
      const imagePath = path.join(
        __dirname,
        "public",
        "images",
        image.replace(/\\/g, "/")
      ); // Adjust the path to your images folder
      doc.image(imagePath, { width: 500 }); // Adjust width as needed
      doc.addPage(); // Add a new page for each image
    });

    // Finalize the PDF document
    doc.end();

    console.log(`PDF file ${pdfName} created successfully.`);

    return successResponse(res, {
      statusCode: 200,
      message: "Get Magazin Successfully!!!",
      payload: {
        name: book.bookName,
        data: book.bookImages,
        pdfPath: `/pdf/${pdfName}`, // Return the PDF path
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  getBooks,
  getBookPages,
  getBooksForClient,
  getBookPagesForClient,
  updateBookPages,
  deleteBook,
};
