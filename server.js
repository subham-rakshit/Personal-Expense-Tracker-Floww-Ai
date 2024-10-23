import express from "express";
import { PORT_NUMBER } from "./config/envConfig.js";
import connectDB from "./utils/mongodbConnection.js";
import cookieParser from "cookie-parser";
import { authRouter, trackerRouter } from "./router/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express(); //INFO: To create a server instance

app.use(cookieParser()); //INFO: Allow the toke to store in cookies
app.use(express.json()); //INFO: Allow the access the JSON data

app.use("/api/auth", authRouter);
app.use("/api/tracker", trackerRouter);

app.use(errorMiddleware); //INFO: Allow the error middleware

//NOTE: Connection ---
connectDB().then(() => {
  app.listen(PORT_NUMBER, () => {
    console.log(`Server listening on port ${PORT_NUMBER}`);
  });
});
