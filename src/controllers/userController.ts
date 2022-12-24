import { RequestHandler } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws/s3Client';
import Account from '../models/accountModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import {
  getOne,
  updateOne,
  createOne,
  deleteOne,
  getAll,
} from '../utils/handlerFactory';

/**
 * Sets `req.params.id` using `req.user` (protect middleware should come before this one)
 */
export const setIdParamToUserId: RequestHandler = (req, _, next) => {
  req.params.id = req.user!.accountUid;
  next();
};

export const getMe = getOne(Account, {
  attributes: {
    exclude: [
      'active',
      'password',
      'passwordChangedAt',
      'passwordResetToken',
      'passwordResetExpires',
      'activationToken',
      'activationExpires',
    ],
  },
});

export const updateMe = updateOne(Account, {
  fields: ['firstName', 'lastName'],
  returning: ['account_uid', 'first_name', 'last_name'],
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const { password }: { password: unknown } = req.body;

  if (!password || typeof password !== 'string')
    return next(new AppError('No password was passed.', 400));

  // Fetch password to compare to
  await req.user!.reload({ attributes: ['password'] });

  if (!(await req.user!.correctPassword(password))) {
    return next(new AppError('Wrong password.', 400));
  }

  // Delete account if passwords match
  await req.user!.destroy();

  res
    .clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'dev',
    })
    .status(204)
    .json({ status: 'success', data: null });
});

export const signProfileImg = catchAsync(async (req, res, next) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `users/${req.user!.accountUid}-avatar.jpg`,
    ContentType: 'image/jpeg',
  });

  try {
    const signedRequest = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    res.status(200).json({
      status: 'success',
      data: { signedRequest },
    });
  } catch (_) {
    return next(new AppError('Error reaching image host.', 500));
  }
});

export const setBodyProfileImgField: RequestHandler = (req, _, next) => {
  req.body.profileImg = `${req.user!.accountUid}-avatar.jpg`;

  next();
};

export const updateProfileImg = updateOne(Account, {
  fields: ['profileImg'],
  returning: ['profile_img'],
});

// Admin only:

export const createUser = createOne(Account);

/**
 * Finds user using `req.params.id`
 */
export const getUser = getOne(Account, {
  attributes: { exclude: ['password'] },
});

export const updateUser = updateOne(Account, {
  fields: [
    'username',
    'firstName',
    'lastName',
    'password',
    'passwordConfirm',
    'email',
    'profileImg',
    'role',
    'active',
    'activationToken',
    'activationExpires',
  ],
  returning: ['*'],
});

export const deleteUser = deleteOne(Account);

export const getAllUsers = getAll(Account, [['createdAt', 'ASC']], {
  exclude: ['password'],
});
