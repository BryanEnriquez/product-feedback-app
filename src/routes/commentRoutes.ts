import express from 'express';
import * as commentC from '../controllers/commentController';
import { protect, isCreatorOrAdmin } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(commentC.requireProductRequestId, commentC.getAllComments)
  .post(protect, commentC.createComment);

router.use(protect);

router
  .route('/:id')
  .all(isCreatorOrAdmin)
  .patch(commentC.updateComment)
  .delete(commentC.deleteComment);

export default router;
