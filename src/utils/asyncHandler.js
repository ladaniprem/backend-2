/**
 * Higher-order function to wrap async route handlers for proper error handling
 * Ensures promise rejections are caught and forwarded to Express error handling
 * @param {Function} requestHandler - Async route handler function to be wrapped
 * @returns {Function} Express middleware function with centralized error handling
 */
const asyncHandler = (requestHandler) => {
  // Return Express middleware function that wraps the async request handler
  return (req, res, next) => {
    // Wrap the request handler in a promise chain to catch both sync and async errors
    Promise.resolve(requestHandler(req, res, next))
      // Propagate any caught errors to Express's error handling middleware
      .catch((error) => next(error));
  };
};

export { asyncHandler };

// Historical implementation alternatives (commented for reference):
// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}
// const asyncHandler = (func) => async() => {}
// const asyncHandler =(fn) => () => {}

// Example of alternative try/catch implementation (commented out):
// const asyncHandler = (fn) => async(req,res,next) => {
//     try {
//         await fn(req,res,next);
//     }
//     catch (error) {
//         res.status(err.code||500).json({
//             success:false,
//             message: err.message,
//         })
//     }
// }
