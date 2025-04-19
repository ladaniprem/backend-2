/**
 * Custom error class for API error handling
 * Extends built-in Error class to add additional error context
 */
class ApiError extends Error {
    constructor(
        statusCode,         // HTTP status code for error response (e.g., 400, 404, 500)
        message = "Something went wrong",  // Human-readable error description
        errors = [],        // Array of validation errors or individual error details
        stack = ""          // Stack trace for error location debugging
    ) {
        super(message);     // Initialize base Error class with message
        
        // Error metadata properties
        this.statusCode = statusCode;  // HTTP status code
        this.data = null;              // Consistent field for error data (null for errors)
        this.message = message;        // Error message from arguments
        this.success = false;          // Success flag (always false for errors)
        this.errors = errors;          // Detailed error information/validation errors

        // Stack trace handling
        if (stack) {
            // Use provided stack trace if available
            this.stack = stack;
        } else {
            // Capture stack trace from current execution context
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };