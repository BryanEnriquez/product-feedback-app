const { Op } = require('sequelize');
const Comment = require('../models/commentModel');
const factory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.checkForProductRequestId = (req, res, next) => {
  if (!req.query.productRequestId) {
    if (req.params.productRequestId) {
      req.query.productRequestId = req.params.productRequestId;
      return next();
    }

    return next(new AppError('No product request ID was passed.', 400));
  }
  next();
};

// NOTE: Table trigger also does some validation
// Ex: parentId<->commentId and productRequestId on both comment and reply must match
exports.createComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.create(
    {
      content: req.body.content,
      author: [req.user.username, req.user.fullName],
      accountUid: req.user.accountUid,
      productRequestId:
        req.body.productRequestId || req.params.productRequestId,
      ...(req.body.parentId && { parentId: req.body.parentId, depth: 1 }),
    },
    { returning: ['*'] }
  );

  return res.status(201).json({ status: 'success', data: { comment } });
});

exports.updateComment = factory.updateOne(
  Comment,
  ['content'],
  ['comment_id', 'content']
);

// NOTE: Trigger wipes data when accountUid is set to null
// Also happens automatically when an account is deleted
exports.deleteComment = catchAsync(async (req, res, next) => {
  const [changed, _] = await Comment.update(
    { accountUid: null },
    {
      where: {
        commentId: req.params.id,
        deleted: false,
        ...(req.includeUserId && { accountUid: req.user.accountUid }),
      },
      fields: ['accountUid'],
      returning: ['account_uid'],
    }
  );

  if (!changed)
    return next(new AppError('No comment with that ID exists.', 404));

  res.status(204).json({ status: 'success', data: null });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const offset = (page - 1) * limit;
  const newest = req.query.newest === 'true' ? 'DESC' : 'ASC';

  const comments = await Comment.findAll({
    where: {
      productRequestId: req.query.productRequestId,
      parentId: { [Op.is]: null },
    },
    order: [['created_at', newest]],
    include: { model: Comment },
    limit,
    offset,
  });

  res.status(200).json({ status: 'success', data: { comments } });
});
