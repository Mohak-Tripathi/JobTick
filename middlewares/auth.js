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

  console.log(token, "mohak")
  //if no token
  if (!token) {     //chapter - 66 Logout User => Q/A section explained why two !!

    //answer=>  The issue is in auth middleware in isAuthenticatedUser. The token value is null if a user is not logged in, but its type is a string. In the below line where you are checking token.
//if(!token) {  }

//Simply put two ! operators here. It would be like this:
//if(!!token) {  }
// !! basically converts Object to boolean. If it was falsey (e.g. 0, null, undefined, etc.), it will be false, otherwise, true.

    
    return next(new ErrorHandler("Login first to access this resource", 401)); //here return is important otherwise it will come here
  }

  //if token exists;

  const decoded = jwt.verify(token, process.env.JWT_SECRET); //jwt algorithm will compare. If true then good. We will access "id". We added users "_id" in payload data as first parameter.

  // console.log(decoded, "hihi");

  console.log(decoded.id);
  req.user = await User.findById(decoded.id); // here we are attaching "user" in req object and sending forward. Now we can access=> req.user anywhere. 

  next(); // this is the end so no need to add return. Nothing is there after that.
});


//Handling users roles. 

exports.authorizeRoles = (...roles) => {  //we are passing the roles to the authorization from "routes" - Only admin and employer are allowed. 
  return (req, res, next) =>{

    if(!roles.includes(req.user.role)){
      return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403))
    }
    next()
  }
}

//Internal function will act as middleware function, the outer function will act as the wrapper.

//In the outer function, we pass our roles and in the middleware function, we have access to the req, res, next in which we can validate the user role and return the error message if role doesn't matches.