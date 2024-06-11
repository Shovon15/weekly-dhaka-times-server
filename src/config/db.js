const mongoose = require("mongoose");
const { mongoDB } = require("../secret");
const connectDB = async (options = {}) => {
	try {
		await mongoose.connect(mongoDB, options);
		console.log(`DB connect successfully!!! `);

		mongoose.connection.on("error", (error) => {
			console.error("DB connection error", error);
		});
	} catch (error) {
		console.error("Could not connect to DB", error.toString());
	}
};
module.exports = connectDB;
