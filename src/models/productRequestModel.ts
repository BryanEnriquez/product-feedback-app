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
import type { ProductModel } from './productModel';
import type { AccountModel } from './accountModel';
import type { UpvoteModel } from './upvoteModel';
import type { CommentModel } from './commentModel';

const productRequestCategories = [
  'ui',
  'ux',
  'enhancement',
  'bug',
  'feature',
] as const;
type ProductRequestCategories = typeof productRequestCategories[number];

const productRequestStatuses = [
  'suggestion',
  'planned',
  'in-progress',
  'live',
] as const;
type ProductRequestStatuses = typeof productRequestStatuses[number];

class ProductRequest extends Model<
  InferAttributes<ProductRequest>,
  InferCreationAttributes<ProductRequest>
> {
  declare productRequestId: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare comments: number | null;
  declare upvotes: number | null;
  declare category: ProductRequestCategories;
  declare status: CreationOptional<ProductRequestStatuses>;

  declare createdAt: CreationOptional<Date>;

  declare productId: ForeignKey<number>;
  declare accountUid: ForeignKey<string>;

  declare static associations: {
    Product: Association<ProductRequest, ProductModel>;
    Account: Association<ProductRequest, AccountModel>;
    Upvotes: Association<ProductRequest, UpvoteModel>;
    Comments: Association<ProductRequest, CommentModel>;
  };
}

ProductRequest.init(
  {
    productRequestId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(val) {
        if (typeof val !== 'string')
          throw new Error('Invalid title. Expected a valid string');

        const clean = purify.sanitize(val);
        this.setDataValue('title', clean);
      },
      validate: {
        len: {
          args: [10, 50],
          msg: 'Minimum title length: 10, max: 50',
        },
      },
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
      set(val) {
        if (typeof val !== 'string')
          throw new Error('Invalid description. Expected a valid string');

        const clean = purify.sanitize(val);
        this.setDataValue('description', clean);
      },
      validate: {
        len: {
          args: [20, 200],
          msg: 'Minimum description length: 20, max: 200',
        },
      },
    },
    comments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.ENUM,
      values: productRequestCategories,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: productRequestStatuses,
      allowNull: false,
      defaultValue: 'suggestion',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'product_request',
    underscored: true,
    updatedAt: false,
    // Creates index on foreign key (see database/associations)
    // indexes: [{ using: 'BTREE', fields: ['account_uid'] }],
  }
);

export type ProductRequestModel = ProductRequest;

export default ProductRequest;
