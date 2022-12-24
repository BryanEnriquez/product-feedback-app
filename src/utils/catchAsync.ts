import { Request, Response, NextFunction } from 'express';

type CatchAsync = {
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
};

/**
 * Use case: Simplify using async/await by making try/catch blocks optional in handlers.
 * @param fn An express request handler `(req, res, next) => { ... }`
 * @returns A function wrapper that internally calls the passed handler
 * and automatically calls next() with any uncaught error.
 */
const catchAsync: CatchAsync = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next);

export default catchAsync;
