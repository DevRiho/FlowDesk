// Standardized Application Error Class.
// Extending Error allows us to attach an explicit HTTP statusCode and operational flag.
// Operational errors represent expected runtime errors (e.g. invalid input, unauthorized access,
// entity not found) versus programmatic bugs (e.g. syntax error, undefined reference).
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture clean stack trace omitting the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

