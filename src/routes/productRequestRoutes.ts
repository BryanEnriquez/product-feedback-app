import express from 'express';
import * as prController from '../controllers/productRequestController';
import {
  isSignedIn,
  protect,
  adminOnly,
  isCreatorOrAdmin,
} from '../controllers/authController';
import upvoteRouter from './upvoteRoutes';
import commentRouter from './commentRoutes';

const router = express.Router({ mergeParams: true });

router.use('/:productRequestId/comments', commentRouter);
router.use('/:productRequestId/upvotes', upvoteRouter);

router
  .route('/')
  .get(
    isSignedIn,
    prController.requireQueryOrParamProductId,
    prController.getAllProductRequestsAndUpvotes
  )
  .post(
    protect,
    prController.requireBodyOrParamProductId,
    prController.createProductRequest
  );

router.get('/all', protect, adminOnly, prController.getAllProductRequests);

router
  .route('/:id')
  .get(prController.getProductRequest)
  .all(protect, isCreatorOrAdmin)
  .patch(prController.updateProductRequest)
  .delete(prController.deleteProductRequest);

export default router;
