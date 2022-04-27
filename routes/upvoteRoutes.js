const express = require('express');
const authController = require('../controllers/authController');
const upvoteController = require('../controllers/upvoteController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .all(upvoteController.setIdArgs)
  .post(upvoteController.createUpvote)
  .delete(upvoteController.deleteUpvote);

router.use(authController.adminOnly);

module.exports = router;
