const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/sequelize');
const DOMPurify = require('../utils/domPurify');

class Comment extends Model {}

// NOTE: Setter method runs before validators
Comment.init(
  {
    commentId: {
      field: 'comment_id',
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
      set(val) {
        const clean = DOMPurify.sanitize(val);
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
      field: 'reply_to',
      // Holds username, first+last names
      type: DataTypes.ARRAY(DataTypes.STRING(32)),
    },
    author: {
      type: DataTypes.ARRAY(DataTypes.STRING(32)),
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'comment',
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = Comment;
