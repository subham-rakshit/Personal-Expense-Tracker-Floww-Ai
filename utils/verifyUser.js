import jwt from "jsonwebtoken";
import { JWT_SIGNATURE } from "../config/envConfig.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt_token; //NOTE: Extract token from request's cookies

  if (!token) {
    const authErr = {
      status: 401,
      message: "Invalid User",
      extraDetails: "User unauthenticated or already logged out!",
    };
    return next(authErr);
  } else {
    //NOTE: Verify the token with JWT_SIGNATURE
    jwt.verify(token, JWT_SIGNATURE, (err, user) => {
      if (err) {
        const jwtErr = {
          status: 401,
          message: "Token doesn't matched",
          extraDetails: "Invalid User!",
        };
        return next(jwtErr);
      } else {
        req.user = user; //NOTE: User details is stored in request data
        next(); //NOTE: Next function call
      }
    });
  }
};
