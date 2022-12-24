import { RequestHandler } from 'express';
import sequelize from '../database/sequelize';
import ProductRequest from '../models/productRequestModel';
import Upvote from '../models/upvoteModel';
import AppError from '../utils/appError';
import * as factory from '../utils/handlerFactory';

/**
 * Require `productId` to be passed in the request body or as a path param
 */
export const requireBodyOrParamProductId: RequestHandler = (req, _, next) => {
  const { productId }: { productId: unknown } = req.body;

  if (
    productId &&
    (typeof productId === 'number' ||
      (typeof productId === 'string' && productId.trim().length > 0))
  ) {
    req.body.productId = productId;
  } else if (req.params.productId) {
    req.body.productId = req.params.productId;
  } else {
    return next(new AppError('Product id is missing.', 400));
  }

  req.body.accountUid = req.user!.accountUid;

  next();
};

/**
 * Require `productId` to be passed as a path param OR query value
 */
export const requireQueryOrParamProductId: RequestHandler = (req, _, next) => {
  if (!req.query.productId || typeof req.query.productId !== 'string') {
    if (req.params.productId) {
      req.query.productId = req.params.productId;
      return next();
    }

    return next(new AppError('No product ID was passed.', 400));
  }

  next();
};

export const createProductRequest = factory.createOne(ProductRequest, {
  fields: [
    'title',
    'description',
    'category',
    'status',
    'productId',
    'accountUid',
  ],
});

export const getProductRequest = factory.getOne(ProductRequest);

export const updateProductRequest = factory.updateOne(ProductRequest, {
  fields: ['title', 'description', 'category', 'status'],
  returning: [
    'product_request_id',
    'title',
    'description',
    'category',
    'status',
  ],
});

export const deleteProductRequest = factory.deleteOne(ProductRequest);

export const getAllProductRequests = factory.getAll(ProductRequest, [
  ['upvotes', 'DESC'],
]);

export const getAllProductRequestsAndUpvotes = factory.getAllAndJoin(
  ProductRequest,
  [['upvotes', 'DESC']],
  {
    model: Upvote,
    attributes: [
      // Avoids "userUpvoted" from being returned as "Upvotes.userUpvoted" when sending to FE
      // Or having to use `nest: true` just to transform it to: `{ Upvotes: { userUpvoted: true } }`
      // @ts-ignore - Expects: `attributes: [[sequelize.literal(), "alias"]]`
      sequelize.literal(
        '(CASE WHEN "Upvotes"."account_uid" IS NOT NULL THEN true ELSE false END) AS "userUpvoted"'
      ),
    ],
    // Defaults to inner join due to SearchAPI setting `options.include.where` to match the current user's id
    required: false, // Set to false to load product requests/feedback even if not upvoted by the user
  }
);
