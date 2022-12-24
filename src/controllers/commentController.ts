import { RequestHandler } from 'express';
import { CreationAttributes, Op } from 'sequelize';
import Comment from '../models/commentModel';
import { updateOne } from '../utils/handlerFactory';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const requireProductRequestId: RequestHandler = (req, _, next) => {
  const { productRequestId: id } = req.query;

  if (id && typeof id === 'string') return next();
  else if (req.params.productRequestId) {
    req.query.productRequestId = req.params.productRequestId;
    return next();
  }

  next(new AppError('No product request ID was passed.', 400));
};

export const createComment = catchAsync(async (req, res, next) => {
  const id: unknown = req.body.productRequestId || req.params.productRequestId;

  if (!id || !(typeof id === 'number' || typeof id === 'string')) {
    return next(new AppError('Expected a valid product request ID.', 400));
  }

  const user = req.user!;

  const inputs: CreationAttributes<Comment> = {
    content: req.body.content as string,
    author: [user.username, user.fullName],
    authorImg: user.profileImg,
    accountUid: user.accountUid,
    productRequestId: Number(id),
  };

  const { parentId }: { parentId: unknown } = req.body;

  if (parentId) {
    if (typeof parentId === 'number') {
      inputs.parentId = parentId;
      inputs.depth = 1;
    } else {
      return next(
        new AppError('Expected a valid parent comment reference', 400)
      );
    }
  }

  // Note - Some column values are set and/or validated automatically by a table trigger
  const comment = await Comment.create(
    inputs,
    // @ts-ignore
    { returning: ['*'] }
  );

  return res.status(201).json({ status: 'success', data: { comment } });
});

export const updateComment = updateOne(Comment, {
  fields: ['content'],
  returning: ['comment_id', 'content'],
});

// NOTE: A trigger clears some columns when `account_uid` is set to null
// This also happens automatically when the associated account is deleted
export const deleteComment = catchAsync(async (req, res, next) => {
  const [changed, _] = await Comment.update(
    { accountUid: null },
    {
      where: {
        commentId: req.params.id,
        deleted: false,
        ...(req.includeUserId && { accountUid: req.user!.accountUid }),
      },
      fields: ['accountUid'],
      returning: ['account_uid' as 'accountUid'],
    }
  );

  if (!changed)
    return next(new AppError('No comment with that ID exists.', 404));

  res.status(204).json({ status: 'success', data: null });
});

export const getAllComments = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const newest = req.query.newest === 'true' ? 'DESC' : 'ASC';

  const comments = await Comment.findAll({
    where: {
      productRequestId: Number(req.query.productRequestId),
      parentId: { [Op.is]: null },
    },
    order: [['createdAt', newest]],
    include: { model: Comment },
    limit,
    offset,
  });

  res.status(200).json({ status: 'success', data: { comments } });
});
