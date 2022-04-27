const express = require('express');
const productRequestController = require('../controllers/productRequestController');
const authController = require('../controllers/authController');
const upvoteRouter = require('./upvoteRoutes');
const commentRouter = require('./commentRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:productRequestId/comments', commentRouter);
router.use('/:productRequestId/upvotes', upvoteRouter);

router
  .route('/')
  .get(
    authController.isSignedIn,
    productRequestController.checkForProductId,
    productRequestController.getAllProductRequestsAndUpvotes
  )
  .all(authController.protect)
  .post(
    productRequestController.setIds_User_Product,
    productRequestController.createProductRequest
  );

router.get(
  '/all',
  authController.protect,
  authController.adminOnly,
  productRequestController.getAllProductRequests
);

router
  .route('/:id')
  .get(productRequestController.getProductRequest)
  .all(authController.protect, authController.isCreatorOrAdmin)
  .patch(productRequestController.updateProductRequest)
  .delete(productRequestController.deleteProductRequest);

module.exports = router;
