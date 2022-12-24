import { RequestHandler } from 'express';
import { Op } from 'sequelize';
import Upvote from '../models/upvoteModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { createOne } from '../utils/handlerFactory';

export const setIdArgs: RequestHandler = (req, _, next) => {
  req.body.accountUid = req.user!.accountUid;

  const { productRequestId: id }: { productRequestId: unknown } = req.body;

  if (id && (typeof id === 'number' || typeof id === 'string')) {
    return next();
  } else if (req.params.productRequestId) {
    req.body.productRequestId = req.params.productRequestId;
    return next();
  }

  next(new AppError('No product request id was passed.', 400));
};

export const createUpvote = createOne(Upvote, {
  fields: ['accountUid', 'productRequestId'],
});

export const deleteUpvote = catchAsync(async (req, res, next) => {
  const deleteCount = await Upvote.destroy({
    where: {
      accountUid: req.user!.accountUid,
      productRequestId: req.body.productRequestId,
    },
  });

  if (!deleteCount) return next(new AppError('No upvote to remove.', 404));

  res.status(204).json({ status: 'success', data: null });
});

export const getUserUpvotes = catchAsync(async (req, res, next) => {
  const { ids } = req.query;

  if (!ids || typeof ids !== 'string') {
    return next(new AppError('Invalid ID parameter.', 400));
  }

  const upvotes = await Upvote.findAll({
    where: {
      accountUid: req.user!.accountUid,
      productRequestId: { [Op.in]: ids.split(',') },
    },
    attributes: ['productRequestId'],
    raw: true,
  });

  res.status(200).json({ status: 'success', data: { upvotes } });
});
