const sequelize = require('../database/sequelize');
const ProductRequest = require('../models/productRequestModel');
const Upvote = require('../models/upvoteModel');
const AppError = require('../utils/appError');
const factory = require('../utils/handlerFactory');

exports.setIds_User_Product = (req, res, next) => {
  req.body.accountUid = req.user.accountUid;

  // If accessed through nested route
  if (!req.body.productId) req.body.productId = req.params.productId;

  next();
};

exports.checkForProductId = (req, res, next) => {
  if (!req.query.productId) {
    if (req.params.productId) {
      req.query.productId = req.params.productId;
      return next();
    }

    if (req.user?.role === 'admin') return next();

    return next(new AppError('No product ID was passed.', 400));
  }

  next();
};

exports.createProductRequest = factory.createOne(ProductRequest, {
  fields: [
    'title',
    'description',
    'category',
    'status',
    'productId',
    'accountUid',
  ],
});

exports.getProductRequest = factory.getOne(ProductRequest);

exports.updateProductRequest = factory.updateOne(ProductRequest, [
  'title',
  'description',
  'category',
  'status',
]);

exports.deleteProductRequest = factory.deleteOne(ProductRequest);

exports.getAllProductRequests = factory.getAll(ProductRequest, [
  ['upvotes', 'DESC'],
]);

exports.getAllProductRequestsAndUpvotes = factory.getAllAndJoin(
  ProductRequest,
  [['upvotes', 'DESC']],
  {
    model: Upvote,
    // attributes: ['accountUid'],
    attributes: [
      sequelize.literal(
        'CASE WHEN "Upvotes"."account_uid" IS NOT NULL THEN true ELSE false END "userUpvoted"'
      ),
    ],
    required: false,
  }
);
