import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { expenseTrackerObj } from "../controllers/expenseTracker.js";

const trackerRouter = express.Router();

trackerRouter
  .route("/transactions/create")
  .post(verifyToken, expenseTrackerObj.createTransactions);

trackerRouter
  .route("/transactions/getAll")
  .get(verifyToken, expenseTrackerObj.getAllTransactions);

trackerRouter
  .route("/transactions/get/:transactionId")
  .get(verifyToken, expenseTrackerObj.getSpecificTransaction);

trackerRouter
  .route("/transactions/update/:transactionId")
  .put(verifyToken, expenseTrackerObj.updateSpecifTransaction);

trackerRouter
  .route("/transactions/delete/:transactionId")
  .delete(verifyToken, expenseTrackerObj.deleteSpecificTransaction);

trackerRouter
  .route("/transactions/summary")
  .get(verifyToken, expenseTrackerObj.getSummary);

export default trackerRouter;
