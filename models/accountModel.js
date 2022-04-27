const crypto = require('crypto');
const { promisify } = require('util');
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../database/sequelize');

const aRandomBytes = promisify(crypto.randomBytes);

class Account extends Model {
  async correctPassword(passedPassword) {
    return await bcrypt.compare(passedPassword, this.password);
  }

  changedPasswordAfter(jwtIssuedAt) {
    if (this.passwordChangedAt) {
      // JWT iat uses seconds and not ms. Divide by 1000
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      // JWT is no longer valid if changedAt is greater than iat
      return jwtIssuedAt < changedTimestamp;
    }

    return false;
  }

  async setTokenAndExpires(tokenField, expiresField, expiresIn) {
    const token = (await aRandomBytes(32)).toString('hex');

    this[tokenField] = crypto.createHash('sha256').update(token).digest('hex');

    // expiresIn is in minutes
    this[expiresField] = new Date(Date.now() + expiresIn * 60 * 1000);

    return token;
  }

  async createPasswordResetToken() {
    return await this.setTokenAndExpires(
      'passwordResetToken',
      'passwordResetExpires',
      15
    );
  }

  async createActivationToken() {
    return await this.setTokenAndExpires(
      'activationToken',
      'activationExpires',
      180
    );
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
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

  static protectIncludeList() {
    return [
      'accountUid',
      'username',
      'firstName',
      'lastName',
      'email',
      'role',
      'passwordChangedAt',
    ];
  }
}

Account.init(
  {
    accountUid: {
      field: 'account_uid',
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
          args: /^[a-z0-9.]{4,20}$/i,
          msg: 'Username may only contain: [letters, numbers, .] and must be between 4-20 characters',
        },
        notNull: { msg: 'Please enter a username' },
      },
    },
    firstName: {
      field: 'first_name',
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
      field: 'last_name',
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
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    profileImg: {
      field: 'profile_img',
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
        verifyPasswords(val) {
          if (typeof this.password !== 'string' || typeof val !== 'string')
            throw new Error('Invalid input for password fields');

          if (this.password !== val) throw new Error('Passwords do not match');

          // If check fails, then throw err
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
      field: 'activation_token',
      type: DataTypes.STRING(64),
    },
    activationExpires: {
      field: 'activation_expires',
      type: DataTypes.DATE,
    },
    passwordChangedAt: {
      field: 'password_changed_at',
      type: DataTypes.DATE,
    },
    passwordResetToken: {
      field: 'password_reset_token',
      type: DataTypes.STRING(64),
    },
    passwordResetExpires: {
      field: 'password_reset_expires',
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'account',
    createdAt: 'created_at',
    updatedAt: false,
    // underscored: true,
  }
);

Account.addHook('beforeSave', async function (user, options) {
  // changed() is TRUE for new instances and for updates involving this field
  if (!user.changed('password')) return;

  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = null;

  // If not new and updated: set changed at
  if (user.isNewRecord) return;

  options.fields.push('passwordChangedAt');
  user.passwordChangedAt = Date.now() - 1000;
});

Account.addHook('beforeSave', async function (user, options) {
  if (!user.isNewRecord) return;

  // Adds to list of fields allowed to be set
  // For bulk create the dupe fields are filtered out
  options.fields.push('activationToken', 'activationExpires');

  const token = (await aRandomBytes(32)).toString('hex');

  user.emailToken = token;
  user.activationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  // expires in 3 hours
  user.activationExpires = new Date(Date.now() + 3 * 60 * 60 * 1000);
});

module.exports = Account;
