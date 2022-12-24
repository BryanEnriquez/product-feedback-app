import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Association,
} from 'sequelize';
import sequelize from '../database/sequelize';
import type { ProductRequestModel } from './productRequestModel';

class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare productId: CreationOptional<number>;
  declare name: string;
  declare suggestions: number | null;
  declare planned: number | null;
  declare inProgress: number | null;
  declare live: number | null;

  declare static associations: {
    ProductRequests: Association<Product, ProductRequestModel>;
  };
}

Product.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: [4, 20],
        notNull: {
          msg: 'A product name is required',
        },
      },
    },
    suggestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    planned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    inProgress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    live: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    tableName: 'product',
  }
);

export type ProductModel = Product;

export default Product;
