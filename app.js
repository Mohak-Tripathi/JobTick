const express = require("express");
const app = express();

const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean')
const hpp = require("hpp")
const cors = require('cors')

const connectDataBase = require("./config/database")
const errorMiddleware = require("./middlewares/errors")
const ErrorHandler = require("./utils/errorHandler")


//setting config environemnt file variable-
dotenv.config({ path: "./config/config.env" });



//Handling Uncaught Exceptions 
// Important to put it at the top as much as possible. 

//console.log(kdsdlskdslkdls)  -- this is uncaught exception. So if this comes before. Then we can't catch but if comes after then we can so put as above as possible. 

process.on("uncaughtException", err =>{
  console.log(`ERROR: ${err.stack}`);
  console.log(`Shutting down due to uncaught exception`);
  process.exit(1);   // in this case we don't need to close the server. Just need to come out (exit) from the process.
})

// connecting database 
connectDataBase()

//Set up Security headers => Use Helmet

app.use(helmet()) //for increasing security. 



//Setting up the body parser
app.use(express.json());

//Setting cookie parser
app.use(cookieParser());

//Handle file upload.
app.use(fileUpload()); 

//Sanitize data
app.use(mongoSanitize());

//Prevent xss attacks
app.use(xssClean());

//Prevent Parameter Pollution
app.use(hpp({
  whitelist: ["positions"]
}))

//Set CORS => Accesible by other domains.
app.use(cors());

//Rate Limiting
const limiter = rateLimit({
  windowMs : 10*60*1000, //10Minutes
max: 100
});

app.use(limiter);



//-------------------------------------------------------------------------------------------------------------------------------
// it was just for practice

// Creating middleware just for practice 

// const middleware = (req, res, next) =>{
//   console.log("Creating middleware")

//   //setting up user variable globally 
//   req.user = "Mohak Tripathi";
//   req.requestMethod= req.method;
//   req.middlewareURL= req.url;
//   next()

// }


// putting middleware in action - 
// app.use(middleware)

//-----------------------------------------------------------------------------------------------------------------



//importing all routes
const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const user = require("./routes/user");


app.use("/api/v1", jobs);
app.use("/api/v1", auth);
app.use("/api/v1", user);


//Handle Unhandled Routes. 
//Note => Important to write this after all routes becz=> 
//Here, .all = represent all method (GET, POST etc) and "*" represent all routes, so 
// if you put this before all routes, in all time only this API (methos + route) will be called. 

app.all("*", function(req, res, next){
  next( new ErrorHandler(`${req.originalUrl} route not found`, 404))
})


//Middleware to handle errors- --------
// this middleware should be at the bottom.
//Global error handling middleware 

// The code starts in jobsController.js, which contains your route handlers and business logic for handling job-related requests. When an error occurs in one of these route handlers, you create an error object using new ErrorHandler("Job not found", 404).
// From jobsController.js, the error object is passed to the Express.js application defined in app.js. This happens implicitly when you call next(errorObject).
// In app.js, you've configured your Express application to use the errorMiddleware as global error handling middleware with app.use(errorMiddleware);. This middleware is defined in error.js.
// When an error occurs and reaches app.use(errorMiddleware);, it's processed by the errorMiddleware function defined in error.js. This middleware inspects the error object, checks the environment, and constructs an appropriate error response based on the error properties and the environment.
// Finally, the errorMiddleware sends the error response to the client with the correct status code and error message, completing the error handling process.
// So, the flow of error handling starts in the route handlers (e.g., jobsController.js), propagates through the Express application (app.js), and is ultimately processed and responded to by the errorMiddleware defined in error.js. This is a typical pattern for handling errors in an Express.js application.

app.use(errorMiddleware);

const PORT = process.env.PORT;

const server = app.listen(8080, () => {
  console.log(
    `Server is listening at port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});



//Handling Unhandled Promise Rejection 

process.on("unhandledRejection", err =>{

  console.log(`Error: ${err.stack}`);
  console.log(`Shutting down server due to unhandled promise rejection`);

  server.close(()=>{
    process.exit(1);
  })
})


