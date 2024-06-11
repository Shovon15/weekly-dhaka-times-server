const express = require("express");
const {
	userSignup,
	userLogin,
	userProfile,
	userProfileUpdate,
	userForgetPassword,
	userPassowrdUpdate,
	userResetPassword,
} = require("../controllers/userController");
const { isLogedIn } = require("../middleware/isLogedIn");

const userRouter = express.Router();

userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);
// userRouter.post("/logout", userLogout);
userRouter.get("/profile", isLogedIn, userProfile);
userRouter.post("/update-profile/:token", isLogedIn, userProfileUpdate);
userRouter.post("/update-password", isLogedIn, userPassowrdUpdate);
userRouter.post("/forget-password", userForgetPassword);
userRouter.put("/reset-password", userResetPassword);
// userRouter.get("/", users);

module.exports = userRouter;
