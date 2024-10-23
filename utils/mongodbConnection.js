import mongoose from "mongoose";
import { MONGODB_URI } from "../config/envConfig.js";

const URI = MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB Successfully Connected.");
  } catch (error) {
    console.log(`Database connection error: ${error}`);
    process.exit(1); //NOTE: Exit the process with an ERROR
  }
};

export default connectDB;
