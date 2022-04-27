const Upvote = require('../models/upvoteModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../utils/handlerFactory');

exports.setIdArgs = (req, res, next) => {
  req.body.accountUid = req.user.accountUid;
  req.body.productRequestId ??= req.params.productRequestId;
  next();
};

exports.createUpvote = factory.createOne(Upvote, {
  fields: ['accountUid', 'productRequestId'],
});

exports.deleteUpvote = catchAsync(async (req, res, next) => {
  const deleteCount = await Upvote.destroy({
    where: {
      accountUid: req.user.accountUid,
      productRequestId: req.body.productRequestId,
    },
  });

  if (!deleteCount) return next(new AppError('No upvote to remove.', 404));

  res.status(204).json({ status: 'success', data: null });
});
