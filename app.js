const express = require("express");
const app = express();

const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");

const connectDataBase = require("./config/database")
const errorMiddleware = require("./middlewares/errors")
const ErrorHandler = require("./utils/errorHandler")


//setting config environemnt file variable-
dotenv.config({ path: "./config/config.env" });



//Handling Uncaught Exceptions 
// Important to put it at the top as much as possible. 

//console.log(kdsdlskdslkdls)  -- this is uncaught exception. So if this comes before. Then we can't catch but if comes after then we can so put as above as possible. 

process.on("uncaughtException", err =>{
  console.log(`ERROR: ${err.message}`);
  console.log(`Shutting down due to uncaught exception`);
  process.exit(1);   // in this case we don't need to close the server. Just need to come out (exit) from the process.
})


// connecting database 
connectDataBase()

//Setting up the body parser
app.use(express.json());

//Setting cookie parser
app.use(cookieParser());





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
app.use(errorMiddleware);

const PORT = process.env.PORT;

const server = app.listen(3000, () => {
  console.log(
    `Server is listening at port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});


//Handling Unhandled Promise Rejection 

process.on("unhandledRejection", err =>{

  console.log(`Error: ${err.message}`);
  console.log(`Shutting down server due to unhandled promise rejection`);

  server.close(()=>{
    process.exit(1);
  })
})


