import UserCollection from "../models/user.js";

export const authControllerObj = {
  //NOTE: SignUp --
  async signUpController(req, res, next) {
    const { firstName, lastName, password } = req.body;

    //NOTE: Check the firstName and lastName characters
    if (firstName.length < 3 || lastName.length < 3) {
      const nameInputErr = {
        status: 400,
        message: "Invalid name!",
        extraDetails: "Name at least 3 characters.",
      };
      return next(nameInputErr);
    }

    //NOTE: Check the valid password
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      const passwordErr = {
        status: 400,
        message: "Invalid password",
        extraDetails:
          "Password must be at least 8 characters long.\n - At least one uppercase letter (A-Z)\n - At least one lowercase letter (a-z)\n - At least one number (0-9)\n - At least one special character (e.g., @, $, !, %, *, ?, &)",
      };
      return next(passwordErr);
    }

    //NOTE: Check the user already exists in the database or not
    try {
      const userDetails = await UserCollection.findOne({ firstName, lastName });

      if (userDetails) {
        const userExistsErr = {
          status: 409, //INFO: Conflict of request data
          message: "User already exists.",
          extraDetails:
            "It looks like you're already registered. Please Login to your account.",
        };
        return next(userExistsErr);
      }

      //NOTE: Create a new User
      const userCreated = new UserCollection({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password.trim(),
      });

      await userCreated.save(); //INFO: Save the user details in DB

      //NOTE: Response
      res
        .status(201)
        .cookie("jwt_token", await userCreated.generateToken(), {
          httpOnly: true,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //INFO: After 30days
        })
        .json({
          success: true,
          message: "User created successfully",
        });
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Login --
  async loginController(req, res, next) {
    const { firstName, lastName, password } = req.body;

    //NOTE: Check the firstName and lastName characters
    if (firstName.length < 3 || lastName.length < 3) {
      const nameInputErr = {
        status: 400,
        message: "Invalid name!",
        extraDetails: "Name at least 3 characters.",
      };
      return next(nameInputErr);
    }

    //NOTE: Check the valid password
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      const passwordErr = {
        status: 400,
        message: "Invalid password",
        extraDetails:
          "Password must be at least 8 characters long.\n - At least one uppercase letter (A-Z)\n - At least one lowercase letter (a-z)\n - At least one number (0-9)\n - At least one special character (e.g., @, $, !, %, *, ?, &)",
      };
      return next(passwordErr);
    }

    //NOTE: Check the user exists in the database or not
    try {
      const userDetails = await UserCollection.findOne({ firstName, lastName });

      if (!userDetails) {
        const loginErr = {
          status: 409, //INFO: Conflict of request data
          message: "User already exists.",
          extraDetails:
            "User not found. If you don't have an account, please SignUp first.",
        };
        return next(loginErr);
      } else {
        //NOTE: Compare the password
        const isPasswordMatch = userDetails.passwordCompare(
          password,
          userDetails.password
        );

        if (isPasswordMatch) {
          res
            .status(200)
            .cookie("jwt_token", await userDetails.generateToken(), {
              httpOnly: true,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //INFO: After 30days
            })
            .json({
              success: true,
              message: "Welcome back! You have successfully logged in.",
            });
        } else {
          const passwordErr = {
            status: 401, //INFO: Unauthorized
            message: "Invalid username or password",
            extraDetails: "Invalid username or password. Please try again.",
          };

          return next(passwordErr);
        }
      }
    } catch (error) {
      return next(error);
    }
  },

  //NOTE: Logout --
  async logoutController(req, res, next) {
    try {
      return res.clearCookie("jwt_token").status(200).json({
        success: true,
        message: "You have successfully logged out.",
      });
    } catch (error) {
      return next(error);
    }
  },
};
