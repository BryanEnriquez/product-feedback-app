const { promisify } = require('util');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const Account = require('../models/accountModel');
const sequelize = require('../database/sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const asyncSign = promisify(jwt.sign);
const asyncVerify = promisify(jwt.verify);

const createSendToken = async (res, statusCode, user, includeUser = true) => {
  const token = await asyncSign(
    { id: user.accountUid },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'dev',
  });

  res.status(statusCode).json({
    status: 'success',
    ...(includeUser && { data: { user: user.getCoreFields() } }),
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await Account.create(req.body, {
    fields: [
      'username',
      'firstName',
      'lastName',
      'email',
      'password',
      'passwordConfirm',
    ],
    returning: ['*'],
  });

  const url = `${req.protocol}://${req.get('host')}/activate-account/${
    newUser.emailToken
  }`;

  new Email(newUser, url).sendWelcome().catch((_) => {
    console.log(`ERROR: Failed to send email to ${newUser.email}`);
  });

  res
    .status(201)
    .json({ status: 'success', message: 'Account successfully created.' });
});

exports.activateAccount = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token)
    return next(new AppError('Expected a token but did not receive one.', 400));

  const hashedToken = Account.hashToken(token);

  const user = await Account.findOne({
    where: {
      activationToken: hashedToken,
      activationExpires: { [Op.gt]: new Date() },
      active: false,
    },
    attributes: ['accountUid'],
  });

  if (!user) return next(new AppError('Token is invalid or has expired.', 400));

  await user.update({
    active: true,
    activationToken: null,
    activationExpires: null,
  });

  res
    .status(200)
    .json({ status: 'success', message: 'Account successfully activated!' });
});

exports.resendActivationToken = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string')
    return next(
      new AppError('Expected an email but did not receive one.', 400)
    );

  const user = await Account.findOne({
    where: { email, active: false },
    attributes: ['accountUid', 'firstName', 'email'],
  });

  if (!user)
    return next(
      new AppError("Account doesn't exists or is already activated.", 400)
    );

  const activationToken = await user.createActivationToken();

  try {
    // Changes are rolled back automatically if any errors occur
    await sequelize.transaction(async (t) => {
      // Save token and expiration to db
      await user.save({
        fields: ['activationToken', 'activationExpires'],
        transaction: t,
      });

      const url = `${req.protocol}://${req.get(
        'host'
      )}/activate-account/${activationToken}`;

      // Send email
      await new Email(user, url).resendActivationToken();
    });
  } catch (err) {
    return next(
      new AppError('This action could not be completed at this time.', 500)
    );
  }

  res.status(200).json({ status: 'success', message: 'Check your inbox!' });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email and password.', 400));
  }

  const user = await Account.findOne({
    where: { email, active: true },
    attributes: [
      'accountUid',
      'username',
      'firstName',
      'lastName',
      'profileImg',
      'password',
      'email',
      'role',
    ],
  });

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect login credentials.', 401));
  }

  await createSendToken(res, 200, user);
});

exports.logout = (req, res, next) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  const { jwt: token } = req.cookies;

  if (!token) {
    return next(new AppError('Please log in to gain access.', 401));
  }

  const decoded = await asyncVerify(token, process.env.JWT_SECRET);

  // Returns null if no user is found
  const currentUser = await Account.findByPk(decoded.id, {
    attributes: Account.protectIncludeList(),
  });

  if (!currentUser) {
    return next(new AppError('Invalid JWT. Log in to gain access.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password was recently changed! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.isSignedIn = async (req, res, next) => {
  const { jwt: token } = req.cookies;

  if (!token) return next();

  try {
    const decoded = await asyncVerify(token, process.env.JWT_SECRET);

    const currentUser = await Account.findByPk(decoded.id, {
      attributes: Account.protectIncludeList(),
    });

    if (!currentUser) return next();

    if (currentUser.changedPasswordAfter(decoded.iat)) return next();

    req.user = currentUser;
    next();
  } catch (_) {
    next();
  }
};
exports.returnUser = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    ...(req.user && { user: req.user.getCoreFields() }),
  });
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Unauthorized user. You do not have the necessary permissions.',
          403
        )
      );
    }

    next();
  };
};
exports.adminOnly = restrictTo('admin');
exports.nonDemoOnly = restrictTo('user', 'admin');

exports.isCreatorOrAdmin = (req, res, next) => {
  if (req.body.accountUid === req.user.accountUid) {
    req.includeUserId = true;
    return next();
  }

  if (req.user.role === 'admin') return next();

  next(new AppError('You may only modify resources you created.', 403));
};

// Account recovery logic //////
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await Account.findOne({
    where: {
      email: req.body.email,
      active: true,
      role: { [Op.ne]: 'demo user' },
    },
    attributes: ['accountUid', 'firstName', 'email'],
  });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const resetToken = await user.createPasswordResetToken();

  await user.save();

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/account-recovery/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'An email has been sent!',
    });
  } catch (err) {
    await user.update({
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return next(
      new AppError('There as an error sending the email. Try again later!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.params.token || typeof req.params.token !== 'string') {
    return next(new AppError('Expected a token but did not receive one.', 400));
  }

  const hashedToken = Account.hashToken(req.params.token);

  // Find matching reset token
  const user = await Account.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: new Date() },
      role: { [Op.ne]: 'demo user' },
      active: true,
    },
    attributes: [
      'accountUid',
      'username',
      'firstName',
      'lastName',
      'email',
      'role',
      'profileImg',
    ],
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.'), 400);
  }

  await user.update({
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // Clear fields so reset token is no longer valid
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  await createSendToken(res, 200, user);
});
// End of account recovery logic //////

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  const user = await Account.findByPk(req.user.accountUid, {
    attributes: {
      exclude: [
        'active',
        'activationToken',
        'activationExpires',
        'passwordChangedAt',
        'passwordResetToken',
        'passwordResetExpires',
        'createdAt',
      ],
    },
  });

  if (!(await user.correctPassword(passwordCurrent))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  await user.update({ password, passwordConfirm });

  await createSendToken(res, 200, user, false);
});
