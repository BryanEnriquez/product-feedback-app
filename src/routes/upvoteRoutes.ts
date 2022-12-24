import express from 'express';
import { protect } from '../controllers/authController';
import * as upvoteC from '../controllers/upvoteController';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/user', upvoteC.getUserUpvotes);

router
  .route('/')
  .all(upvoteC.setIdArgs)
  .post(upvoteC.createUpvote)
  .delete(upvoteC.deleteUpvote);

export default router;
