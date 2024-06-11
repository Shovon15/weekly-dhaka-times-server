const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const path = require('path');

const { errorResponse } = require("./controllers/responseController");
const connectDB = require("./config/db");
const userRouter = require("./routers/userRouter");
const bookRouter = require("./routers/bookRoutes");


const app = express();

app.use(cors());
// middleware--------------------
app.use(morgan("dev"));
app.use(cookieParser());

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));


app.use("/images", express.static('public/book-images'))
app.use("/pdf", express.static('public/pdf'))


app.use("/api/admin", userRouter);
app.use("/api/book", bookRouter);

// app.use("/api/seed", seedRouter);

app.get("/", (req, res) => {
	res.status(200).send({
		message: "welcome to dhaka times news server!!!",
	});
});
// app.get("/demo", (req, res) => {
// 	res.status(200).send({
// 		message: "demo route!!!",
// 	});
// });
connectDB();

// -----------------------------------------------------
//client error--------------------
app.use((req, res, next) => {
	next(createError(404, "Route not found."));
});

//server error------------------
app.use((err, req, res, next) => {
	return errorResponse(res, {
		statusCode: err.status,
		message: err.message,
	});
});

module.exports = app;
