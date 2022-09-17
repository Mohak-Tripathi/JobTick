module.exports = func => (req, res, next) =>
Promise.resolve(func(req, res, next))
.catch(next); 




//Explaination in Q/A by Gh**

// First of all, we will pass the function in the catchAsyncError.
// Then that function will be received there and then we are returning another function that is (req, res, next) => {}
// In this, we will use Promise.resolve(), which will resolve it.

// If there is any error, then it will be rejected and the error will be caught in the catch.



// One Point:

// .catch(next) IS EQUAL TO .catch(err => next(err))



// I hope that now you have understood this clearly.