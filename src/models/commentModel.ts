import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Association,
} from 'sequelize';
import sequelize from '../database/sequelize';
import purify from '../utils/domPurify';
import type { ProductRequestModel } from './productRequestModel';
import type { AccountModel } from './accountModel';

class Comment extends Model<
  InferAttributes<Comment>,
  InferCreationAttributes<Comment>
> {
  declare commentId: CreationOptional<number>;
  declare depth: CreationOptional<number>;
  declare content: string;
  declare replyTo: string | null;
  declare author: [string, string];
  declare authorImg: string | null;
  declare deleted: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;

  // Foreign key names used by JS are customized through:
  // SomeModel[hasOne | hasMany](OtherModel, { foreignKey: { name: '...' } })
  declare productRequestId: ForeignKey<ProductRequestModel['productRequestId']>;

  // Table trigger automatically sets this to null when the associated account is deleted
  declare accountUid: ForeignKey<AccountModel['accountUid']> | null;

  // Depth 0 comments have no parentId
  declare parentId: ForeignKey<Comment['commentId']> | null;

  declare static associations: {
    ProductRequest: Association<Comment, ProductRequestModel>;
    Account: Association<Comment, AccountModel>;
    Comments: Association<Comment, Comment>;
    Comment: Association<Comment, Comment>;
  };
}

Comment.init(
  {
    commentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    depth: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
    content: {
      type: DataTypes.STRING(250),
      allowNull: false,
      // NOTE: Setter method runs before validators
      set(val) {
        if (typeof val !== 'string')
          throw new Error('Validation error: Unexpected content type');

        const clean = purify.sanitize(val);
        this.setDataValue('content', clean);
      },
      validate: {
        len: {
          args: [10, 250],
          msg: 'Minimum content length: 10, max: 250',
        },
      },
    },
    replyTo: {
      type: DataTypes.STRING(20),
    },
    author: {
      type: DataTypes.ARRAY(DataTypes.STRING(32)),
      allowNull: false,
    },
    authorImg: {
      type: DataTypes.STRING,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'comment',
    underscored: true,
    updatedAt: false,
  }
);

export type CommentModel = Comment;

export default Comment;
