const { Model } = require('sequelize');
const sequelize = require('../database/sequelize');

class Upvote extends Model {}

Upvote.init(
  {},
  {
    sequelize,
    tableName: 'upvote',
    createdAt: 'created_at',
    updatedAt: false,
    // Multi-column(composite) PK ensures a user can only upvote a request once
    indexes: [{ unique: true, fields: ['account_uid', 'product_request_id'] }],
  }
);

// Removes default PK:
Upvote.removeAttribute('id');

module.exports = Upvote;
