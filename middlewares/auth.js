const jwt = require("jsonwebtoken");
const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//Check if the user is authenticated or not.

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //if no token
  if (!token) {
    return next(new ErrorHandler("Login first to access this resource", 401)); //here return is important otherwise it will come here
  }

  //if token exists;

  const decoded = jwt.verify(token, process.env.JWT_SECRET); //jwt algorithm will compare. If true then good. We will access "id". We added users "_id" in payload data as first parameter.

  console.log(decoded, "hihi");
  console.log(decoded.id);
  req.user = await User.findById(decoded.id); // here we are attaching "user" in req object and sending forward. Now we can access=> req.user anywhere. 

  next(); // this is the end so no need to add return. Nothing is there after that.
});
