

const createPdf = async (text) => {
	try {
		return text
	} catch (error) {
		console.error("user image does not exist.");
	}
};

module.exports = { createPdf };
