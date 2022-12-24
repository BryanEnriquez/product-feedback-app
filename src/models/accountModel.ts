import crypto from 'crypto';
import { promisify } from 'util';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  Association,
} from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../database/sequelize';
import type { ProductRequestModel } from './productRequestModel';
import type { UpvoteModel } from './upvoteModel';
import type { CommentModel } from './commentModel';

const aRandomBytes = promisify(crypto.randomBytes);

const accountRoles = ['admin', 'user', 'demo user'] as const;
export type AccountRoles = typeof accountRoles[number];

class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  declare accountUid: CreationOptional<string>;
  declare username: string;
  declare firstName: string;
  declare lastName: string;
  declare profileImg: string | null;
  declare email: string;
  declare password: string;
  declare passwordConfirm: string;
  declare role: CreationOptional<AccountRoles>;
  declare active: CreationOptional<boolean>;
  declare activationToken: string | null;
  declare activationExpires: Date | null;
  declare passwordChangedAt: Date | null;
  declare passwordResetToken: string | null;
  declare passwordResetExpires: Date | null;
  declare createdAt: CreationOptional<Date>;

  declare emailToken?: NonAttribute<string>;

  get fullName(): NonAttribute<string> {
    return `${this.firstName} ${this.lastName}`;
  }

  async correctPassword(passedPassword: string) {
    return await bcrypt.compare(passedPassword, this.password);
  }

  changedPasswordAfter(jwtIssuedAt: number) {
    if (this.passwordChangedAt) {
      // JWT iat uses seconds and not ms. Convert ms to seconds to compare.
      const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

      // JWT is no longer valid if changedAt is greater than iat
      return jwtIssuedAt < changedTimestamp;
    }

    return false;
  }

  /**
   * Sets a hashed token for `activationToken` or `passwordResetToken`. Automatically sets the corresponding expires field.
   * @param tokenField
   * @param expiresIn # of minutes for which the token is valid
   * @returns plain token that can be mailed to user
   */
  async setTokenAndExpires(
    tokenField: 'activationToken' | 'passwordResetToken',
    expiresIn: number
  ) {
    const token = await Account.createToken();

    this[tokenField] = Account.hashToken(token);

    this[
      tokenField === 'activationToken'
        ? 'activationExpires'
        : 'passwordResetExpires'
    ] = new Date(Date.now() + expiresIn * 60 * 1000);

    return token;
  }

  async createPasswordResetToken() {
    return await this.setTokenAndExpires('passwordResetToken', 15);
  }

  /**
   * Sets hashed token on instance and expiration date
   * @returns Unhashed token
   */
  async createActivationToken() {
    return await this.setTokenAndExpires('activationToken', 180);
  }

  static async createToken() {
    return (await aRandomBytes(32)).toString('hex');
  }

  static hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * @returns List of fields required for use in protected routes.
   */
  static protectIncludeList() {
    return [
      'accountUid',
      'username',
      'firstName',
      'lastName',
      'email',
      'role',
      'passwordChangedAt',
      'profileImg',
    ];
  }

  getCoreFields() {
    return {
      accountUid: this.accountUid,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      profileImg: this.profileImg,
      email: this.email,
      role: this.role,
    };
  }

  // The created associations can be inspected through `SomeModel.associations`
  // The default generated name can be customized by setting `as` in hasOne, belongsTo, etc
  declare static associations: {
    ProductRequests: Association<Account, ProductRequestModel>;
    Upvotes: Association<Account, UpvoteModel>;
    Comments: Association<Account, CommentModel>;
  };
}

Account.init(
  {
    accountUid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: crypto.randomUUID,
    },
    username: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      validate: {
        is: {
          args: /^[a-z0-9._]{4,20}$/i,
          msg: 'Username may only contain: [letters, numbers, ., _] and must be between 4-20 characters',
        },
        notNull: { msg: 'Please enter a username' },
      },
    },
    firstName: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        isAlpha: {
          msg: 'First name may only contain letters',
        },
        len: {
          args: [2, 15],
          msg: 'First name must be between 2-15 characters',
        },
        notNull: { msg: 'Please enter your first name' },
      },
    },
    lastName: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        isAlpha: {
          msg: 'Last name may only contain letters',
        },
        len: {
          args: [2, 15],
          msg: 'Last name must be between 2-15 characters',
        },
        notNull: { msg: 'Please enter your last name' },
      },
    },
    profileImg: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      set(val) {
        if (typeof val !== 'string' || val.length >= 50)
          throw new Error('Enter a valid email (max 50 characters)');

        this.setDataValue('email', val.toLowerCase());
      },
      validate: {
        isEmail: { msg: 'Please enter a valid email' },
        notNull: { msg: 'An email is required' },
      },
    },
    password: {
      type: DataTypes.STRING(72),
      allowNull: false,
      validate: {
        notNull: { msg: 'Please enter a password' },
      },
    },
    passwordConfirm: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        // validation order when allowNull = false: allowNull validator > custom validators
        notNull: { msg: 'Password confirmation is missing' },
        verifyPasswords(this: Account, val: unknown) {
          if (typeof this.password !== 'string' || typeof val !== 'string')
            throw new Error('Invalid input for password fields');

          if (this.password !== val) throw new Error('Passwords do not match');

          // Check for correct format
          if (!/^[a-zA-Z0-9!@#$%^&*]{8,72}$/.test(val))
            throw new Error(
              'Minimum password length is 8 characters. (Valid chars: letters, numbers, !@#$%^&*)'
            );
        },
      },
    },
    role: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['admin', 'user', 'demo user'],
      defaultValue: 'user',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    activationToken: {
      type: DataTypes.STRING(64),
    },
    activationExpires: {
      type: DataTypes.DATE,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
    },
    passwordResetToken: {
      type: DataTypes.STRING(64),
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'account',
    underscored: true,
    updatedAt: false,
  }
);

// Reminder - Execution order for beforeSave:
// save: validators > beforeSave, update: beforeSave > validators
Account.addHook('beforeSave', async function (user: Account, options) {
  // changed() is TRUE for new instances and for updates involving this field
  if (!user.changed('password')) return;

  user.password = await bcrypt.hash(user.password, 12);

  // If not new and updated: set changed at
  if (user.isNewRecord || !options.fields) return;

  options.fields.push('passwordChangedAt');
  user.passwordChangedAt = new Date(Date.now() - 1000);
});

Account.addHook('afterSave', (user: Account) => {
  if (user.changed('password')) user.passwordConfirm = '';
});

// Automatically set activationToken and activationExpires fields for new accounts
Account.addHook('beforeSave', async function (user: Account, options) {
  if (!user.isNewRecord) return;

  // Adds to list of fields allowed to be set
  // For bulk create the dupe fields are filtered out
  if (!options.fields) return;

  options.fields.push('activationToken', 'activationExpires');

  const token = await Account.createToken();

  user.emailToken = token;
  user.activationToken = Account.hashToken(token);

  // expires in 3 hours
  user.activationExpires = new Date(Date.now() + 3 * 60 * 60 * 1000);
});

export type AccountModel = Account;

export default Account;
