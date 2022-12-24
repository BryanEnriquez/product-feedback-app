import { promisify } from 'util';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import type {
  NextFunction,
  Request,
  Response,
  RequestHandler,
  CookieOptions,
} from 'express';
import Account, { AccountRoles } from '../models/accountModel';
import sequelize from '../database/sequelize';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Email from '../utils/email';

interface ValidAppJWTPayload extends jwt.JwtPayload {
  id: string;
  iat: number;
}

const signJWT = promisify<
  string | Buffer | object,
  jwt.Secret,
  jwt.SignOptions,
  string | undefined
>(jwt.sign);

const verifyJWT = promisify<
  string,
  jwt.Secret | jwt.GetPublicKeyOrSecret,
  string | jwt.Jwt | jwt.JwtPayload | ValidAppJWTPayload | undefined
>(jwt.verify);

const {
  NODE_ENV,
  DOMAIN,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES_IN,
  HEROKUAPP_HOST,
  SAME_SITE,
} = process.env;

const getCookieOptions = (req: Request): CookieOptions => ({
  httpOnly: true,
  secure: NODE_ENV !== 'dev',
  sameSite: SAME_SITE,
});

const createSendToken = async (
  req: Request,
  res: Response,
  statusCode: number,
  user: Account,
  includeUser = true
) => {
  const token = await signJWT({ id: user.accountUid }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + Number(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    ...getCookieOptions(req),
  });

  res.status(statusCode).json({
    status: 'success',
    data: { user: includeUser ? user.getCoreFields() : null },
  });
};

export const signup = catchAsync(async (req, res) => {
  const newUser = await Account.create(req.body, {
    fields: [
      'username',
      'firstName',
      'lastName',
      'email',
      'password',
      'passwordConfirm',
    ],
    // Inference breaks when setting a custom `field` for a key or setting `underscored: true` in Model.init
    // @ts-ignore
    returning: ['first_name', 'email'],
  });

  const url = `${req.protocol}://${
    NODE_ENV === 'production' ? DOMAIN : req.get('host')
  }/activate-account/${newUser.emailToken}`;

  new Email(newUser, url).sendWelcome().catch((_) => {
    console.log(`ERROR: Failed to send email to ${newUser.email}`);
  });

  res
    .status(201)
    .json({ status: 'success', message: 'Account successfully created.' });
});

export const activateAccount = catchAsync(async (req, res, next) => {
  const { token }: { token: unknown } = req.body;

  if (!token || typeof token !== 'string')
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

export const resendActivationToken = catchAsync(async (req, res, next) => {
  const { email }: { email: unknown } = req.body;

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
    // Automatically roll back if email fails to send
    await sequelize.transaction(async (t) => {
      await user.save({
        fields: ['activationToken', 'activationExpires'],
        transaction: t,
      });

      const url = `${req.protocol}://${
        NODE_ENV === 'production' ? DOMAIN : req.get('host')
      }/activate-account/${activationToken}`;

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

export const login = catchAsync(async (req, res, next) => {
  const { email, password }: { email: unknown; password: unknown } = req.body;

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
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

  await createSendToken(req, res, 200, user);
});

export const logout: RequestHandler = (req, res) => {
  res.clearCookie('jwt', getCookieOptions(req));

  res.status(200).json({ status: 'success' });
};

export const protect = catchAsync(async (req, _, next) => {
  const { jwt: token }: { jwt: undefined | string } = req.cookies;

  if (!token) {
    return next(new AppError('Please log in to gain access.', 401));
  }

  // v8.5.1 https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
  const decoded = (await verifyJWT(token, JWT_SECRET)) as ValidAppJWTPayload;

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

export const isSignedIn = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { jwt: token }: { jwt: string | undefined } = req.cookies;

  if (!token) return next();

  try {
    const decoded = (await verifyJWT(token, JWT_SECRET)) as ValidAppJWTPayload;

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

export const returnUser: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user ? req.user.getCoreFields() : null },
  });
};

const restrictTo = (...roles: AccountRoles[]) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
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

export const adminOnly = restrictTo('admin');

export const nonDemoOnly = restrictTo('user', 'admin');

/**
 * Expects the user's id in the request body.
 */
export const isCreatorOrAdmin = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const user = req.user!;

  if (req.body.accountUid === user.accountUid) {
    req.includeUserId = true;
    return next();
  }

  if (user.role === 'admin') return next();

  next(new AppError('You may only modify resources you created.', 403));
};

// Account recovery logic //////

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email }: { email: unknown } = req.body;

  if (!email || typeof email !== 'string')
    return next(new AppError('Invalid input', 404));

  const user = await Account.findOne({
    where: {
      email,
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
    const resetURL = `${req.protocol}://${
      NODE_ENV === 'production' ? DOMAIN : req.get('host')
    }/account-recovery/${resetToken}`;

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

    next(
      new AppError('There as an error sending the email. Try again later!', 500)
    );
  }
});

/**
 * Expects `token` emailed to user and new `password` + `passwordConfirm` in `req.body`
 */
export const resetPassword = catchAsync(async (req, res, next) => {
  if (!req.params.token) {
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
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // Validate and update password
  await user.update({
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // Clear fields so reset token is no longer valid
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  await createSendToken(req, res, 200, user);
});
////// End of account recovery logic //////

/**
 * Used to update current password when already logged in
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const { passwordCurrent }: { passwordCurrent: unknown } = req.body;

  if (typeof passwordCurrent !== 'string')
    return next(new AppError('Wrong format for current password', 400));

  const user = (await Account.findByPk(req.user!.accountUid, {
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
  }))!;

  if (!(await user.correctPassword(passwordCurrent))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  await user.update({ password, passwordConfirm });

  await createSendToken(req, res, 200, user, false);
});
