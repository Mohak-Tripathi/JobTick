const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//Register a new user => /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  //Create JWT token
  const token = user.getJwtToken();

  res.status(200).json({
    suceess: true,
    message: "Successfully registered",

    // data: user
    token,
  });
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

const isPasswordMatched = await user.comparePassword(password)

if(!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or password", 401)); // we checked email only404))
}

// Create JSON Web Token- 

const token = user.getJwtToken();

res.status(200).json({
    success: true,
    token
})

});
