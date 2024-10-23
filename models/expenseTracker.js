import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String, //INFO: income || expense
    required: true,
  },
  category: {
    type: String, //INFO: Salary, Food or ...
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String, //INFO: Salary, Food or ...
    required: true,
  },
  type: {
    type: String, //INFO: income || expense
    required: true,
  },
});

const TransactionCollection = new mongoose.model(
  "Transaction",
  transactionSchema
);

const CategoryCollection = new mongoose.model("Category", categorySchema);

export { TransactionCollection, CategoryCollection };
