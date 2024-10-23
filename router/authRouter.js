import express from "express";
import { authControllerObj } from "../controllers/authController.js";
import { verifyToken } from "../utils/verifyUser.js";

const authRouter = express.Router();

authRouter.route("/signup").post(authControllerObj.signUpController);
authRouter.route("/login").post(authControllerObj.loginController);
authRouter
  .route("/logout")
  .post(verifyToken, authControllerObj.logoutController);

export default authRouter;
