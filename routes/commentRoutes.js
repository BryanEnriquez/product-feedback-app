const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    commentController.checkForProductRequestId,
    commentController.getAllComments
  )
  .post(authController.protect, commentController.createComment);

router.use(authController.protect);

router
  .route('/:id')
  .all(authController.isCreatorOrAdmin)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
