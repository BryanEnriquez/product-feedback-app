import express from 'express';
import * as auth from '../controllers/authController';
import * as user from '../controllers/userController';
import { bodyIsObject } from '../middlewares/bodyIsObject';

const router = express.Router();

router.get('/loginStatus', auth.isSignedIn, auth.returnUser);
router.post('/signup', bodyIsObject, auth.signup);
router.patch('/activateAccount', auth.activateAccount);
router.post('/resendActivationToken', auth.resendActivationToken);
router.post('/login', auth.login);
router.get('/logout', auth.logout);
router.post('/forgotPassword', auth.forgotPassword);
router.patch('/resetPassword/:token', auth.resetPassword);

router.use(auth.protect);

router
  .route('/me')
  .all(user.setIdParamToUserId)
  .get(user.getMe)
  .patch(user.updateMe)
  .all(auth.nonDemoOnly)
  .delete(user.deleteMe);

router.patch('/updateMyPassword', auth.nonDemoOnly, auth.updatePassword);

router.get('/sign-s3', user.signProfileImg);

router.patch(
  '/updateProfileImg',
  user.setIdParamToUserId,
  user.setBodyProfileImgField,
  user.updateProfileImg
);

router.use(auth.adminOnly);

router.route('/').get(user.getAllUsers).post(user.createUser);

router
  .route('/:id')
  .get(user.getUser)
  .patch(user.updateUser)
  .delete(user.deleteUser);

export default router;
