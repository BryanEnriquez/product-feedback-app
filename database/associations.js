const { DataTypes } = require('sequelize');
const Product = require('../models/productModel');
const Account = require('../models/accountModel');
const ProductRequest = require('../models/productRequestModel');
const Upvote = require('../models/upvoteModel');
const Comment = require('../models/commentModel');

// Defining a FK:
// Define the column for both models in a pair. This is the attribute name used by JS.
// Leaving one call out results in duplicate FKs.
// Define `field` to map it to a different name in the DB.

// A product can have many product requests
Product.hasMany(ProductRequest, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'productId',
    field: 'product_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
ProductRequest.belongsTo(Product, { foreignKey: 'productId' });

// A user can have many requests
Account.hasMany(ProductRequest, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'accountUid',
    field: 'account_uid',
    type: DataTypes.UUID,
    allowNull: false,
  },
});
ProductRequest.belongsTo(Account, { foreignKey: 'accountUid' });

// An upvote is associated with an account and product request
// Upvote model also creates a composite key using accountUid and productRequestId
Account.hasMany(Upvote, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'accountUid',
    field: 'account_uid',
    type: DataTypes.UUID,
    allowNull: false,
  },
});
Upvote.belongsTo(Account, { foreignKey: 'accountUid' });

ProductRequest.hasMany(Upvote, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'productRequestId',
    field: 'product_request_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
Upvote.belongsTo(ProductRequest, { foreignKey: 'productRequestId' });

// A request can have multiple comments
ProductRequest.hasMany(Comment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'productRequestId',
    field: 'product_request_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
Comment.belongsTo(ProductRequest, {
  foreignKey: 'productRequestId',
});

// A user can have multiple comments
Account.hasMany(Comment, {
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'accountUid',
    field: 'account_uid',
    type: DataTypes.UUID,
  },
});
Comment.belongsTo(Account, { foreignKey: 'accountUid' });

// A comment can have replies
Comment.hasMany(Comment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: 'parentId',
    field: 'parent_id',
    type: DataTypes.INTEGER,
  },
});
Comment.belongsTo(Comment, { foreignKey: 'parentId' });
