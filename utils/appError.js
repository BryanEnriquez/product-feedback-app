class AppError extends Error {
  constructor(message, statusCode) {
    // Copy error msg
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Save stack trace on returned error obj
    // Also set stack trace to stop at this.constructor (AppError class definition)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
