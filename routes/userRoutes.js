const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.get(
  '/loginStatus',
  authController.isSignedIn,
  authController.returnUser
);
router.post('/signup', authController.signup);
router.patch('/activateAccount', authController.activateAccount);
router.post('/resendActivationToken', authController.resendActivationToken);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router
  .route('/me')
  .all(userController.setIdParam)
  .get(userController.getMe)
  .all(authController.nonDemoOnly)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

router.patch(
  '/updateMyPassword',
  authController.nonDemoOnly,
  authController.updatePassword
);

router.get('/sign-s3', userController.signProfileImg);

router.patch(
  '/updateProfileImg',
  userController.setIdParam,
  userController.setUserProfileImg,
  userController.updateProfileImg
);

router.use(authController.adminOnly);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
