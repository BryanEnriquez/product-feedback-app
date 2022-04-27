const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const productRequestRouter = require('./productRequestRoutes');

const router = express.Router();

router.use('/:productId/productRequests', productRequestRouter);

router
  .route('/')
  .all(authController.protect, authController.adminOnly)
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .all(authController.protect, authController.adminOnly)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
