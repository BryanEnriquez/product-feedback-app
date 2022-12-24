import Product from '../models/productModel';
import Account from '../models/accountModel';
import ProductRequest from '../models/productRequestModel';
import Upvote from '../models/upvoteModel';
import Comment from '../models/commentModel';

const PRODUCT_ID = 'productId';
const ACCOUNT_ID = 'accountUid';
const PRODUCT_REQUEST_ID = 'productRequestId';

// A product can have many product requests
Product.hasMany(ProductRequest, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: PRODUCT_ID,
    allowNull: false,
    // field: "product_id", // Automatically created by `underscored: true` option on model
  },
});
// Defining a custom `name` like above requires setting `foreignKey` like below
// avoid duplicate columns in the DB. Otherwise the 2nd call will use the default generated name.
ProductRequest.belongsTo(Product, { foreignKey: PRODUCT_ID });

// A user can have many product requests
Account.hasMany(ProductRequest, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: ACCOUNT_ID,
    allowNull: false,
  },
});
ProductRequest.belongsTo(Account, { foreignKey: ACCOUNT_ID });

// An upvote is associated with an account and product request
// Upvote model also creates a composite key using accountUid and productRequestId
Account.hasMany(Upvote, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: ACCOUNT_ID,
    allowNull: false,
  },
});
Upvote.belongsTo(Account, { foreignKey: ACCOUNT_ID });

ProductRequest.hasMany(Upvote, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: PRODUCT_REQUEST_ID,
    allowNull: false,
  },
});
Upvote.belongsTo(ProductRequest, { foreignKey: PRODUCT_REQUEST_ID });

// A request can have multiple comments
ProductRequest.hasMany(Comment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: PRODUCT_REQUEST_ID,
    allowNull: false,
  },
});
Comment.belongsTo(ProductRequest, { foreignKey: PRODUCT_REQUEST_ID });

// A user can have multiple comments
Account.hasMany(Comment, {
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: ACCOUNT_ID,
  },
});
Comment.belongsTo(Account, { foreignKey: ACCOUNT_ID });

const PARENT_ID = 'parentId';

// A comment can have replies
Comment.hasMany(Comment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: {
    name: PARENT_ID,
  },
});
Comment.belongsTo(Comment, { foreignKey: PARENT_ID });
