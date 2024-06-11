const app = require("./app");
const { serverPort } = require("./secret");
// const connectDB = require("./config/db");

app.listen(serverPort, async () => {
	console.log(`Dhaka news times server running on ${serverPort}`);
	// await connectDB();
});
