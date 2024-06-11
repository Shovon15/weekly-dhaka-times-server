const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { jwtActivationKey } = require("../secret");

const isLogedIn = async (req, res, next) => {
	try {
		const token = req.headers['authorization'];

		if (!token) {
			throw createError(401, "Access Token Not Found.please Login first");
		}

		const decoded = jwt.verify(token, jwtActivationKey);

		if (!decoded) {
			throw createError(401, "Invalid Access Token.Login Again");
		}
		req.userId = decoded.id;
		next();
	} catch (error) {
		return next(error);
	}
};

module.exports = { isLogedIn };
