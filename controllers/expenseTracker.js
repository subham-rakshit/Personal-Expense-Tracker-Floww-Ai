import mongoose from "mongoose";
import {
  CategoryCollection,
  TransactionCollection,
} from "../models/expenseTracker.js";

export const expenseTrackerObj = {
  //NOTE: Create a new Transaction
  async createTransactions(req, res, next) {
    const { type, category, amount, date, description } = req.body;

    //NOTE: Input status check
    if (type && category && amount && date && description) {
      //INFO: Check the valid type
      if (type.toLowerCase() !== "income" && type.toLowerCase() !== "expense") {
        const typeErr = {
          status: 400,
          message: "Invalid type!",
          extraDetails:
            "Please enter a valid transaction type (income/expense).",
        };
        return next(typeErr);
      }

      //INFO: Check the category
      if (category.length < 3) {
        const categoryErr = {
          status: 400,
          message: "Invalid category!",
          extraDetails: "Category must be atleast 3 characters long.",
        };
        return next(categoryErr);
      }

      //INFO: Check amount
      if (typeof parseInt(amount) !== "number") {
        const amountErr = {
          status: 400,
          message: "Invalid amount!",
          extraDetails: "Please enter a valid amount value.",
        };
        return next(amountErr);
      }

      //INFO: Check the date DD/MM/YYYY with leap-year
      const regexr =
        /^(?:(?:31\/(0[13578]|1[02]))\/|(?:29|30\/(0[13-9]|1[0-2])\/))\d{4}$|^(?:29\/02\/(?:(?:\d{2}(?:0[48]|[2468][048]|[13579][26]))|(?:[048][048]|[13579][26])00))$|^(0[1-9]|1\d|2[0-8])\/(0[1-9]|1[0-2])\/\d{4}$/;

      if (!date.match(regexr)) {
        const dateErr = {
          status: 400,
          message: "Invalid date!",
          extraDetails:
            "Please provide a valide date (DD/MM/YYYY) in this format.",
        };
        return next(dateErr);
      }

      //INFO: Check despriction
      if (description.length < 3 || description.length > 100) {
        const descriptionErr = {
          status: 400,
          message: "Invalid description!",
          extraDetails:
            "Description must be in between 3 and 100 characters long.",
        };
        return next(descriptionErr);
      }
    } else {
      const inputErr = {
        status: 400,
        message: "Missing input field!",
        extraDetails: "Please fill the all input fileds.",
      };

      return next(inputErr);
    }

    //NOTE: Check the transaction already exists or not with specified userID
    try {
      const isTransactionExists = await TransactionCollection.findOne({
        type,
        category,
        amount,
        date,
        description,
        user: req.user.userId,
      });
      if (isTransactionExists) {
        const existErr = {
          status: 400,
          message: "Transaction duplicate found!",
          extraDetails:
            "Your transaction already exists. Please update your transaction details if you want.",
        };

        return next(existErr);
      } else {
        //INFO: Create a new transaction with specified userID
        const trimCategory = category.trim();
        const trimType = type.trim();
        const transactionCreated = new TransactionCollection({
          type:
            trimType[0].toUpperCase() +
            trimType.slice(1, trimType.length).toLowerCase(),
          category:
            trimCategory[0].toUpperCase() +
            trimCategory.slice(1, trimCategory.length).toLowerCase(),
          amount: amount.trim(),
          date: date.trim(),
          description: description.trim(),
          user: req.user.userId,
        });

        await transactionCreated.save();

        //NOTE: Check the category already exists in CategoryCollection or not
        const categoryDetails = await CategoryCollection.findOne({
          name: category,
          type,
        });
        //INFO: If no category exists in CategoryCollection the create a new one
        if (!categoryDetails) {
          const trimCategory = category.trim();
          const trimType = type.trim();
          const categoryCreated = new CategoryCollection({
            name:
              trimCategory[0].toUpperCase() +
              trimCategory.slice(1, trimCategory.length).toLowerCase(),
            type:
              trimType[0].toUpperCase() +
              trimType.slice(1, trimType.length).toLowerCase(),
          });
          await categoryCreated.save();
        }

        //NOTE: Response
        res.status(201).json({
          success: true,
          message: "New transaction is created successfully.",
          transactionDetails: transactionCreated,
        });
      }
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Get All Transaction
  async getAllTransactions(req, res, next) {
    const { firstName, lastName } = req.user;

    //INFO: Retrieve all the transactions of requested user
    try {
      const transactionList = await TransactionCollection.find({
        user: req.user.userId,
      });

      if (transactionList.length === 0) {
        res.status(200).json({
          success: true,
          message: `${firstName} ${lastName} you have not created any transactions yet. Please create your transactions.`,
          totalTransactions: transactionList.length,
        });
      } else {
        res.status(200).json({
          success: true,
          message: `${firstName} ${lastName} here is your all transactions details.`,
          transactionList,
          totalTransactions: transactionList.length,
        });
      }
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Get A Specific Transaction
  async getSpecificTransaction(req, res, next) {
    const { transactionId } = req.params;
    const { userId } = req.user;

    //INFO: Check ID is present in url or not
    if (!transactionId) {
      const idErr = {
        status: 400,
        message: "Invalid transaction.",
        extraDetails: "Transaction ID must be provided.",
      };
      return next(idErr);
    }

    try {
      const transactionDetails = await TransactionCollection.findOne({
        _id: transactionId,
      });

      //NOTE: If transactionDetails not present
      if (!transactionDetails) {
        const transactionErr = {
          status: 404,
          message: "Transaction not found!",
          extraDetails:
            "There is no transaction present with the specified ID.",
        };
        return next(transactionErr);
      } else {
        //INFO: If user wants to veiw other user's transactions (No permissions)
        if (transactionDetails.user.toString() !== userId) {
          const notAuthorizedErr = {
            status: 403, //INFO: Forbidden permissions
            message: "Access denied!",
            extraDetails:
              "You do not have permission to access this transaction.",
          };
          return next(notAuthorizedErr);
        } else {
          //NOTE: Response
          res.status(200).json({
            success: true,
            transactionDetails,
          });
        }
      }
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Update a spefic transaction
  async updateSpecifTransaction(req, res, next) {
    const { transactionId } = req.params;
    const { userId } = req.user;
    const { type, category, amount, date, description } = req.body;

    //INFO: Check ID is present in url or not
    if (!transactionId) {
      const idErr = {
        status: 400,
        message: "Invalid transaction.",
        extraDetails: "Transaction ID must be provided.",
      };
      return next(idErr);
    }

    //NOTE: Input status check
    if (type && category && amount && date && description) {
      //INFO: Check the valid type
      if (type.toLowerCase() !== "income" && type.toLowerCase() !== "expense") {
        const typeErr = {
          status: 400,
          message: "Invalid type!",
          extraDetails:
            "Please enter a valid transaction type (income/expense).",
        };
        return next(typeErr);
      }

      //INFO: Check the category
      if (category.length < 3) {
        const categoryErr = {
          status: 400,
          message: "Invalid category!",
          extraDetails: "Category must be atleast 3 characters long.",
        };
        return next(categoryErr);
      }

      //INFO: Check amount
      if (typeof parseInt(amount) !== "number") {
        const amountErr = {
          status: 400,
          message: "Invalid amount!",
          extraDetails: "Please enter a valid amount value.",
        };
        return next(amountErr);
      }

      //INFO: Check the date DD/MM/YYYY with leap-year
      const regexr =
        /^(?:(?:31\/(0[13578]|1[02]))\/|(?:29|30\/(0[13-9]|1[0-2])\/))\d{4}$|^(?:29\/02\/(?:(?:\d{2}(?:0[48]|[2468][048]|[13579][26]))|(?:[048][048]|[13579][26])00))$|^(0[1-9]|1\d|2[0-8])\/(0[1-9]|1[0-2])\/\d{4}$/;

      if (!date.match(regexr)) {
        const dateErr = {
          status: 400,
          message: "Invalid date!",
          extraDetails:
            "Please provide a valide date (DD/MM/YYYY) in this format.",
        };
        return next(dateErr);
      }

      //INFO: Check despriction
      if (description.length < 3 || description.length > 100) {
        const descriptionErr = {
          status: 400,
          message: "Invalid description!",
          extraDetails:
            "Description must be in between 3 and 100 characters long.",
        };
        return next(descriptionErr);
      }
    } else {
      const inputErr = {
        status: 400,
        message: "Missing input field!",
        extraDetails: "Please fill the all input fileds.",
      };

      return next(inputErr);
    }

    try {
      //INFO: Get the specific transaction
      const transactionDetails = await TransactionCollection.findOne({
        _id: transactionId,
      });

      //NOTE: If transactionDetails not present
      if (!transactionDetails) {
        const transactionErr = {
          status: 404,
          message: "Transaction not found!",
          extraDetails:
            "There is no transaction present with the specified ID.",
        };
        return next(transactionErr);
      } else {
        //INFO: If user wants to update other user's transactions (No permissions)
        if (transactionDetails.user.toString() !== userId) {
          const notAuthorizedErr = {
            status: 403, //INFO: Forbidden permissions
            message: "Access denied!",
            extraDetails:
              "You do not have permission to access this transaction.",
          };
          return next(notAuthorizedErr);
        } else {
          //INFO: Update the transaction
          const trimCategory = category.trim();
          const trimType = type.trim();
          const updatedTransactionDetails =
            await TransactionCollection.findByIdAndUpdate(
              transactionId,
              {
                $set: {
                  type:
                    trimType[0].toUpperCase() +
                    trimType.slice(1, trimType.length).toLowerCase(),
                  category:
                    trimCategory[0].toUpperCase() +
                    trimCategory.slice(1, trimCategory.length).toLowerCase(),
                  amount: amount.trim(),
                  date: date.trim(),
                  description: description.trim(),
                  user: userId,
                },
              },
              { new: true }
            );

          //INFO: If updated category is not present in CategoryCollection then create a new one.
          const categoryDetails = await CategoryCollection.findOne({
            name: updatedTransactionDetails.category,
          });

          if (!categoryDetails) {
            const trimCategory = updatedTransactionDetails.category.trim();
            const trimType = updatedTransactionDetails.type.trim();
            const categoryCreated = new CategoryCollection({
              name:
                trimCategory[0].toUpperCase() +
                trimCategory.slice(1, trimCategory.length).toLowerCase(),
              type:
                trimType[0].toUpperCase() +
                trimType.slice(1, trimType.length).toLowerCase(),
            });
            await categoryCreated.save();
          }

          //INFO: Response
          res.status(200).json({
            success: true,
            message: "Transaction updated successfully.",
            transactionDetails: updatedTransactionDetails,
          });
        }
      }
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Delete a specific transaction
  async deleteSpecificTransaction(req, res, next) {
    const { transactionId } = req.params;
    const { userId } = req.user;

    //INFO: Check ID is present in url or not
    if (!transactionId) {
      const idErr = {
        status: 400,
        message: "Invalid transaction.",
        extraDetails: "Transaction ID must be provided.",
      };
      return next(idErr);
    }

    try {
      const transactionDetails = await TransactionCollection.findOne({
        _id: transactionId,
      });

      //NOTE: If transactionDetails not present
      if (!transactionDetails) {
        const transactionErr = {
          status: 404,
          message: "Transaction not found!",
          extraDetails:
            "There is no transaction present with the specified ID.",
        };
        return next(transactionErr);
      } else {
        //INFO: If user wants to veiw other user's transactions (No permissions)
        if (transactionDetails.user.toString() !== userId) {
          const notAuthorizedErr = {
            status: 403, //INFO: Forbidden permissions
            message: "Access denied!",
            extraDetails:
              "You do not have permission to access this transaction.",
          };
          return next(notAuthorizedErr);
        } else {
          //INFO: Delete functionality
          await TransactionCollection.findByIdAndDelete(transactionId);
          res.status(200).json({
            success: true,
            message: "Transaction deleted successfully.",
          });
        }
      }
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Get Summary
  async getSummary(req, res, next) {
    const { userId, firstName, lastName } = req.user;
    const { startDate, endDate, category } = req.query;

    try {
      //INFO: Query Info with filterations
      const query = {
        user: userId,
        ...(startDate && { date: { $gte: new Date(startDate) } }), //INFO: >= startDate
        ...(endDate && { date: { $lte: new Date(endDate) } }), //INFO: endDate >= endDate
        ...(category && { category }),
      };

      const allTransactionsList = await TransactionCollection.find(query);

      let totalIncome = 0;
      let totalExpense = 0;

      allTransactionsList.forEach((transaction) => {
        const amount = parseInt(transaction.amount);
        if (transaction.type.toLowerCase() === "income") {
          totalIncome += amount;
        } else if (transaction.type.toLowerCase() === "expense") {
          totalExpense += amount;
        }
      });

      res.status(200).json({
        success: true,
        message: `${firstName} ${lastName} here is your summary`,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      });
    } catch (error) {
      return next(error);
    }
  },
};
