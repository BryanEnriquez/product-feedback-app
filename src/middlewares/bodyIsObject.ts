import { Handler } from 'express';

export const bodyIsObject: Handler = (req, res, next) => {
  if (!Array.isArray(req.body)) return next();

  res.status(400).json({
    status: 'fail',
    message: 'Expected an object but received an array',
  });
};
