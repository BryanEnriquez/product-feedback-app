const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/aws/s3Client');
const Account = require('../models/accountModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../utils/handlerFactory');

exports.setIdParam = (req, res, next) => {
  req.params.id = req.user.accountUid;
  next();
};

exports.getMe = factory.getOne(Account, {
  attributes: {
    exclude: [
      'password',
      'passwordChangedAt',
      'passwordResetToken',
      'passwordResetExpires',
      'activationToken',
      'activationExpires',
    ],
  },
});

exports.updateMe = factory.updateOne(
  Account,
  ['firstName', 'lastName', 'email'],
  ['account_uid', 'first_name', 'last_name', 'email']
);

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Confirm action is intended by requiring password
  const { password } = req.body;
  if (!password) return next(new AppError('No password was passed.', 400));

  // Fetch password to compare to
  await req.user.reload({ attributes: ['password'] });

  if (!(await req.user.correctPassword(password))) {
    return next(new AppError('Wrong password.', 400));
  }

  // Delete account if passwords match
  await req.user.destroy();

  res
    .clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'dev',
    })
    .status(204)
    .json({ status: 'success', data: null });
});

exports.signProfileImg = catchAsync(async (req, res, next) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${req.user.accountUid}-avatar.jpg`,
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

exports.setUserProfileImg = (req, res, next) => {
  req.body.profileImg = `${req.user.accountUid}-avatar.jpg`;

  next();
};

exports.updateProfileImg = factory.updateOne(
  Account,
  ['profileImg'],
  ['profile_img']
);

// Admin only:

exports.createUser = factory.createOne(Account);

exports.getUser = factory.getOne(Account, {
  attributes: { exclude: ['password'] },
});

exports.updateUser = factory.updateOne(Account, [
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
]);

exports.deleteUser = factory.deleteOne(Account);

exports.getAllUsers = factory.getAll(Account, [['created_at', 'ASC']], {
  exclude: ['password'],
});
