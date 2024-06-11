const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const createPDF = async (book) => {
  return new Promise((resolve, reject) => {

    // if (
    //     Array.isArray(book.bookImages) &&
    //     typeof book.bookHeaderImage === "string"
    //   ) {
    //     book.bookImages.unshift(book.bookHeaderImage);
    //   }  


    const pdfDoc = new PDFDocument();
    const pdfName = `${book.slug}.pdf`;
    const pdfPath = path.join(__dirname, 'uploads', pdfName);
    const writeStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(writeStream);

    const bookImagesLength = book.bookImages.length;

    for (let i = 0; i < bookImagesLength; i++) {
      const image = book.bookImages[i];
      const imagePath = path.join(__dirname, 'uploads', image);

      if (fs.existsSync(imagePath)) {
        const { width, height } = pdfDoc.page;
        pdfDoc.image(imagePath, 0, 0, { width, height });

        if (i < bookImagesLength - 1) {
          pdfDoc.addPage();
        }
      } else {
        console.error(`Image not found: ${imagePath}`);
      }
    }

    pdfDoc.end();

    writeStream.on("finish", () => {
      const filename = path.basename(pdfPath);
      resolve(filename);
    });
    writeStream.on("error", reject);
  });
};

module.exports = createPDF;
