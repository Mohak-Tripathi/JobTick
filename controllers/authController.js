
const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken= require("../utils/jwtToken")

//Register a new user => /api/v1/register



// Que- We are creating jwttoken both times while registering user and also when user is login. 
//I believe we use only jwt token which we create during login for various purposes. 
//So kindly put some light on it why we create jwt token in both scenario?

//Ans- In some cases, the user registers the account and can use his/her account directly without logging in again, 
//in that case, we need JWT to authenticate the user and that is the reason we are creating JWT in the register user as well.

//If you don't want this, then you can create a token only in login. It is also fine.


exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  //Create JWT token
//   const token = user.getJwtToken();

//   res.status(200).json({
//     suceess: true,
//     message: "Successfully registered",

//     // data: user
//     token,
//   });

//JWT Token and res.status(...) => this is removed now and replaced with- 
sendToken(user, 200, res);

});

//Login user => /api/v1/login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //Checks if email or password is entered by user.

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email or password"), 400);
  }

  // Finding user in database

  const user = await User.findOne({ email: email }).select("+password"); // we have to select password like that becz we did password false in user model
  // but still above line just check the email not password.

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401)); // we checked email only abhi tak but wrote password as well for better security
    //401 = unauthorised
  }

  //check if password is correct.

  const isPasswordMatched = await user.comparePassword(password); // METHOD comaprePassword written in user.js (model)

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or password", 401)); // we checked email only404))
  }

  // Create JSON Web Token-

//   const token = user.getJwtToken();

//   res.status(200).json({
//     success: true,
//     token,
//   });


//JWT Token and res.status(...) => this is removed now and replaced with- 
sendToken(user, 200, res);


});
