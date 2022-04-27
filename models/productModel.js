const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/sequelize');

class Product extends Model {}

Product.init(
  {
    productId: {
      field: 'product_id',
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
      field: 'in_progress',
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
    tableName: 'product',
  }
);

module.exports = Product;
