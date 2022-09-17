module.exports = (err, req, res, next) => {
  // 4 parameters

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

  if (process.env.NODE_ENV === "production") {
    let error = { ...err }; //creating copy of error;

    error.message = err.message;

    return res.status(err.statusCode).json({
      message: false,
      message: error.message || "Internal Server Error",
    });
  }
};
