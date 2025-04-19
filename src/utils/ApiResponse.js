/**
 * Standardized API response format for successful responses
 * Provides consistent structure for success status, status code, message, and data
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        // HTTP status code for the response (e.g., 200, 201, etc.)
        this.statusCode = statusCode
        
        // Main data payload returned from the API
        this.data = data
        
        // Human-readable message describing the result (default: "Success")
        this.message = message
        
        // Boolean indicating if request was successful (status codes < 400 indicate success)
        this.success = statusCode < 400  // 400+ status codes are client/server errors
    }
}
export {ApiResponse};