
class ErrorHandler extends Error {

    // ErrorHandler extends from Error 
//Error is parent class and ErrorHandler is child class
  
constructor(message, statusCode){

    //we passed the message to parent class constructor i.e "Super"
        super(message); 
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
        //this is "Object" here
    }
}

module.exports = ErrorHandler;