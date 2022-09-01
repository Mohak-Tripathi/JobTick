const express = require("express");
const app = express();

const dotenv = require("dotenv");
const connectDataBase = require("./config/database")

const errorMiddleware = require("./middlewares/errors")

//setting config environemnt file variable-
dotenv.config({ path: "./config/config.env" });


// connecting database 
connectDataBase()

//Setting up the body parser
app.use(express.json());





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

app.use("/api/v1", jobs);

//Middleware to handle errors- --------

app.use(errorMiddleware);

const PORT = process.env.PORT;

app.listen(3000, () => {
  console.log(
    `Server is listening at port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
