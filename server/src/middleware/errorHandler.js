import { config } from '../config/index.js';

// Centralized error-handling middleware.
// Express identifies this as error-handling middleware because it takes 4 arguments: (err, req, res, next).
// This guarantees that all unhandled or intentionally thrown errors in the request-response lifecycle
// return a uniform, predictable JSON shape to the client.
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details for server diagnostics
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    statusCode: err.statusCode,
    stack: config.env === 'development' ? err.stack : undefined,
  });

  // Handle Mongoose CastError (e.g., invalid ObjectId in URL parameter)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid resource identifier: ${err.value}`,
      error: 'InvalidId',
    });
  }

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field || 'value'} already exists.`,
      error: 'DuplicateKeyError',
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // Handle JWT token expiration or invalid signatures
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please log in again.',
      error: 'Unauthorized',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired. Please refresh your session.',
      error: 'TokenExpired',
    });
  }

  // Standard response for operational errors and uncaught exceptions
  return res.status(err.statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    // Never leak stack traces in production environment to avoid exposing system details
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

