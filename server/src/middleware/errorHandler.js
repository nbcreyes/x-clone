/**
 * Custom error class for API errors.
 * Use this to throw errors with a specific HTTP status code
 * and message from anywhere in the app.
 *
 * Usage:
 *   throw new AppError("User not found", 404);
 *   throw new AppError("Unauthorized", 401);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handles requests to routes that do not exist.
 * Registered after all routes in index.js.
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Central error handler.
 * Express identifies this as an error handler because it has 4 parameters.
 * All errors thrown or passed to next() end up here.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code was set
  const statusCode = err.statusCode || 500;

  // Log the full error in development, just the message in production
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else {
    console.error(`Error ${statusCode}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { AppError, notFoundHandler, errorHandler };