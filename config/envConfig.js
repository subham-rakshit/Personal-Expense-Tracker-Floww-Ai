import dotenv from "dotenv";

dotenv.config();

export const { PORT_NUMBER, MONGODB_URI, JWT_SIGNATURE } = process.env;
