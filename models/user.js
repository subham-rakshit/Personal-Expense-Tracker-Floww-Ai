import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SIGNATURE } from "../config/envConfig.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//NOTE: Password hashing before user's data save in DB
userSchema.pre("save", async function (next) {
  const user = this; //INFO: this = user's data which has to be stored

  //INFO: If password already hashed then call the next function
  if (!user.isModified("password")) {
    next();
  }

  try {
    const hashPassword = await bcrypt.hash(user.password, 10);

    user.password = hashPassword;
  } catch (error) {
    next(error);
  }
});

//NOTE: Create a Token for authentication
userSchema.methods.generateToken = function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        firstName: this.firstName,
        lastName: this.lastName,
      },
      JWT_SIGNATURE,
      {
        expiresIn: "30d",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//NOTE: Password Compare
userSchema.methods.passwordCompare = function (password, comparePassword) {
  return bcrypt.compareSync(password, comparePassword);
};

const UserCollection = new mongoose.model("User", userSchema);

export default UserCollection;
