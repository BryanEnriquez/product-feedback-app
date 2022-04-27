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
