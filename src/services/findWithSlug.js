const createError = require("http-errors");
const mongoose = require("mongoose");

const findWithSlug = async (Model, slug, options = {}) => {
	try {
		const item = await Model.findOne({ slug }, options);

		if (!item) {
			throw createError(404, `${Model.modelName} does not exist with this slug`);
		}

		return item;
	} catch (error) {
		if (error instanceof mongoose.Error) {
			throw createError(400, "Invalid slug");
		}

		throw error;
	}
};

module.exports = findWithSlug;
