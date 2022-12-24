import express from 'express';
import userRouter from './userRoutes';
import productRouter from './productRoutes';
import productRequestRouter from './productRequestRoutes';
import commentRouter from './commentRoutes';
import upvoteRouter from './upvoteRoutes';

const router = express.Router();

router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/productRequests', productRequestRouter);
router.use('/comments', commentRouter);
router.use('/upvotes', upvoteRouter);

export const apiV1 = router;
