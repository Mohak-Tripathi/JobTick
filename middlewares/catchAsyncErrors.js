module.exports = func => (req, res, next) =>
Promise.resolve(func(req, res, next))
.catch(next); 


//ChatGPT expanded version - 
// module.exports = function (func) {
//     return function (req, res, next) {
//       // Step 1: Call the provided async function 'func' with the request, response, and next arguments.
//       const resultPromise = func(req, res, next);
  
//       // Step 2: Wrap the result of 'func' in a resolved Promise to ensure it's always a Promise.
//       const resolvedPromise = Promise.resolve(resultPromise);
  
//       // Step 3: Attach an error handler to the Promise.
//       resolvedPromise.catch(function (err) {
//         // Step 4: If any errors occur during the execution of 'func', pass them to the next error-handling middleware.
//         next(err);
//       });
//     };
//   };
  



//Explaination in Q/A by Gh**

// First of all, we will pass the function in the catchAsyncError.
// Then that function will be received there and then we are returning another function that is (req, res, next) => {}
// In this, we will use Promise.resolve(), which will resolve it.

// If there is any error, then it will be rejected and the error will be caught in the catch.

// One Point:

// .catch(next) IS EQUAL TO .catch(err => next(err))



// I hope that now you have understood this clearly.


