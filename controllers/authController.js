const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");

const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");  //built in crypto module


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

//Forgot Password.  => api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  //Check user email in DB.

  if (!user) {
    return next(new ErrorHandler("No user with this email.", 404));
  }

  //Get reset token.

  const resetToken = user.getResetPasswordToken();
// console.log(resetToken, "12345");

  //save the user
  //save the token in DB.
  await user.save({ validateBeforeSave: false }); // we do not want to validate now.

  //create reset password url.

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
  // Here, protocol : http/ https and "host" : localhost or anyother host

  // console.log(resetUrl, "xyz")

  const message = `Your password reset link is as follows:\n\n${resetUrl}\n\n If you have not request the same, kindly ignore and report to us.`;


  // putting in try catch to cover error while sending email. 
  try {
    await sendEmail({
      email: user.email,
      subject: "Jobbee-API Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${user.email}`,
    });
  } catch (error) {
    // if error, we want to make it undefined in DB. Means we are not saving in DB. 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

console.log(error)
    //saving those empty values in DB.
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email is not sent", 500));
  }
});


//Reset Password =>  /api/v1/password/reset/:token

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //Hash url token . We need to hash the token which we are getting from route. And then comapring it with DB stored hashed token.

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ 
    resetPasswordToken,
    resetPasswordExpire : {$gt: Date.now()} // if not the case. It means token expires. 30 minutes lapsed. Not allowed now to change or reset. 
  })

  if(!user){
    return next(new ErrorHandler("Password reset token is invalid or expired"));
  }

  //Setup new Password. 

  user.password = req.body.password;
  user.resetPasswordToken = undefined; // becz now job is done. 
  user.resetPasswordExpire = undefined; // becz now job is done. 

  //save the user password. 

  await user.save();

  //assign the new token as the user recovered his password. 

  sendToken(user, 200, res);


})


//Logout User => /api/v1/logout, 

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),  //expiring cookie right now
    httpOnly: true
   })

   res.status(200).json({
    sucess: true,
    message: "User logged out successfully"
   })
})