const AppError = require('../utils/appError');

const errMsg = {
  SequelizeValidationError: (err) => [
    `Validation error: ${err.errors.map((el) => el.message).join('. ')}.`,
    400,
  ],
  // Ex: Passing a boolean to a field that expects a number
  SequelizeDatabaseError: () => [
    'Invalid input syntax. Double check your inputs.',
    400,
  ],
  SequelizeForeignKeyConstraintError: () => [
    'Issue creating resource. One or more fields is referencing another resource that does not exist.',
    400,
  ],
  SequelizeUniqueConstraintError: (err) => [
    `There was an issue with the following field(s): ${err.errors
      .map((el) => el.path.split('_').join(' '))
      .join(', ')}. Try using different value(s).`,
    400,
  ],
  TokenExpiredError: () => ['Session has expired. Please log in again.', 401],
  // Examples: tampered jwt, empty string, not a string, shortened token
  JsonWebTokenError: () => ['Invalid session. Please log in again.', 401],
};

const sendErrorDev = (err, req, res) => {
  if (err.isOperational) console.log('Operational error: ', err.message);
  else console.log('Error: ', err.name);

  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendRes = (
  res,
  code = 500,
  status = 'error',
  message = 'Internal server error'
) => res.status(code).json({ status, message });

const sendErrorProd = (err, req, res) => {
  if (err.isOperational)
    return sendRes(res, err.statusCode, err.status, err.message);

  console.log('Programming error: ', err);

  sendRes(res);
};

module.exports = (err, req, res, next) => {
  err.statusCode ??= 500;
  err.status ??= 'error';

  if (process.env.NODE_ENV === 'dev') return sendErrorDev(err, req, res);

  const trustedErr = errMsg[err.name]?.(err);

  sendErrorProd(trustedErr ? new AppError(...trustedErr) : err, req, res);
};
