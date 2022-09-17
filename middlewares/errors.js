const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  // 4 parameters
  // console.log(err, "errmesagetocheck")

  err.statusCode = err.statusCode || 500; // if "user" provide statusCode then take that one, otherwise 500

  // In THE development mode, we need to see details of the error but in production, we have to send simple error message like job not found or please enter valid email => So we are dealing diffwerently.
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "production ") {
    //remember there is a "space" after production
    let error = { ...err }; //creating copy of error;

// console.log(error, "papapapapap")

    error.message = err.message;

    // Wrong Mongoose Object ID Error -
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid ${err.path}`;
      error = new ErrorHandler(message, 404);
    }

    //Handling Mongoose Validation Error- 

    if(err.name === "ValidationError"){
      const message = Object.values(err.errors).map(value => value.message)
      error = new ErrorHandler(message, 400)
    }
console.log(error, "mohak")

    return res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }

};
