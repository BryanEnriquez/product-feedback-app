const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/sequelize');
const DOMPurify = require('../utils/domPurify');

class ProductRequest extends Model {}

ProductRequest.init(
  {
    productRequestId: {
      field: 'product_request_id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Ex. Setting up a foreign key if not using associations
    // productId: {
    //   field: 'product_id',
    //   type: DataTypes.INTEGER,
    //   references: {
    //     // model: SomeModel, // Model | 'ModelName'
    //     key: 'product_id', // Name of primary key that is being referenced
    //     deferrable: Deferrable.INITIALLY_DEFERRED,
    //     // Options: NOT, INITIALLY_IMMEDIATE, INITIALLY_DEFERRED
    //   },
    //   // onDelete: "CASCADE", onUpdate: "CASCADE"
    //   // Options: CASCADE, RESTRICT, SET DEFAULT, SET NULL, NO ACTION
    // },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(val) {
        const clean = DOMPurify.sanitize(val);
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
        const clean = DOMPurify.sanitize(val);
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
      values: ['ui', 'ux', 'enhancement', 'bug', 'feature'],
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['suggestion', 'planned', 'in-progress', 'live'],
      allowNull: false,
      defaultValue: 'suggestion',
    },
  },
  {
    sequelize,
    tableName: 'product_request',
    createdAt: 'created_at',
    updatedAt: false,
    // Creates index on foreign key (see database/associations)
    // indexes: [{ using: 'BTREE', fields: ['account_uid'] }],
  }
);

module.exports = ProductRequest;
