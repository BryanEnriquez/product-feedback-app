import AppError from '../utils/appError';
import type { Request, Response, NextFunction } from 'express';
import type { ValidationError, UniqueConstraintError } from 'sequelize';

type UnknownError = Error | AppError | ValidationError | UniqueConstraintError;

type ErrorHandler = (err: UnknownError, req: Request, res: Response) => void;

type GlobalErrorHandler = (
  err: UnknownError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

type ErrorMessages = {
  [errorName: string]: undefined | ((err: UnknownError) => [string, number]);
};

const errorMessages: ErrorMessages = {
  SequelizeValidationError: (err) => [
    `Validation error: ${(err as ValidationError).errors
      .map((el) => el.message)
      .join('. ')}.`,
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
    `There was an issue with the following field(s): ${(
      err as UniqueConstraintError
    ).errors
      .map(({ path }) => (path ? path.split('_').join(' ') : ''))
      .join(', ')}. Try using different value(s).`,
    400,
  ],
  TokenExpiredError: () => ['Session has expired. Please log in again.', 401],
  // Examples: tampered jwt, empty string, not a string, shortened token
  JsonWebTokenError: () => ['Invalid session. Please log in again.', 401],
};

const sendErrorDev: ErrorHandler = (err, _, res) => {
  let status = 'error';
  let statusCode = 500;

  if (err instanceof AppError) {
    console.log('Operational error: ', err.message);
    status = err.status;
    statusCode = err.statusCode;
  } else console.log('Error: ', err.name);

  return res.status(statusCode).json({
    status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendResponse = (
  res: Response,
  code = 500,
  status = 'error',
  message = 'Internal server error'
) => res.status(code).json({ status, message });

const sendErrorProd: ErrorHandler = (err, _, res) => {
  if (err instanceof AppError)
    return sendResponse(res, err.statusCode, err.status, err.message);

  console.log('Programming error: ', err);

  sendResponse(res);
};

const ENV = process.env.NODE_ENV;

const globalErrorHandler: GlobalErrorHandler = (err, req, res, _) => {
  if (ENV === 'dev') return sendErrorDev(err, req, res);

  const trustedErr = errorMessages[err.name]?.(err);

  sendErrorProd(trustedErr ? new AppError(...trustedErr) : err, req, res);
};

export default globalErrorHandler;
