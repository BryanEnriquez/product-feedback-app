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
import type { AccountModel } from './accountModel';
import type { ProductRequestModel } from './productRequestModel';

class Upvote extends Model<
  InferAttributes<Upvote>,
  InferCreationAttributes<Upvote>
> {
  declare accountUid: ForeignKey<AccountModel['accountUid']>;
  declare productRequestId: ForeignKey<ProductRequestModel['productRequestId']>;

  declare createdAt: CreationOptional<Date>;

  declare static associations: {
    Account: Association<Upvote, AccountModel>;
    ProductRequest: Association<Upvote, ProductRequestModel>;
  };
}

Upvote.init(
  {
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'upvote',
    updatedAt: false,
    underscored: true,
    // Multi-column(composite) PK ensures a user can only upvote a request once
    indexes: [{ unique: true, fields: ['account_uid', 'product_request_id'] }],
  }
);

// Removes default PK:
Upvote.removeAttribute('id');

export type UpvoteModel = Upvote;

export default Upvote;
