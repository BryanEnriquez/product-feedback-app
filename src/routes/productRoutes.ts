import express from 'express';
import { protect, adminOnly } from '../controllers/authController';
import {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import productRequestRouter from './productRequestRoutes';

const router = express.Router();

router.use('/:productId/productRequests', productRequestRouter);

router
  .route('/')
  .all(protect, adminOnly)
  .get(getAllProducts)
  .post(createProduct);

router
  .route('/:id')
  .get(getProduct)
  .all(protect, adminOnly)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;
