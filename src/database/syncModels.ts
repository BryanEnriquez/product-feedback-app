import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), 'config.env') });
import { CreationAttributes, SyncOptions } from 'sequelize';
import sequelize from './sequelize';
import './associations';
import Account from '../models/accountModel';
import Product from '../models/productModel';
import ProductRequest from '../models/productRequestModel';
import Comment from '../models/commentModel';
import {
  createUpvoteTriggers,
  createProductRequestTriggers,
  createCommentTriggers,
} from './triggers';

const devDataDir = path.join(process.cwd(), 'dev-data');

const accounts: CreationAttributes<Account>[] = JSON.parse(
  fs.readFileSync(`${devDataDir}/accounts.json`, 'utf-8')
);

const pws: { [username: string]: string } = JSON.parse(
  fs.readFileSync(`${devDataDir}/testDataPWs.json`, 'utf-8')
);

const productRequests: CreationAttributes<ProductRequest>[] = JSON.parse(
  fs.readFileSync(`${devDataDir}/productRequests.json`, 'utf-8')
);

const comments: CreationAttributes<Comment>[] = JSON.parse(
  fs.readFileSync(`${devDataDir}/comments.json`, 'utf-8')
);

accounts.forEach((el) => {
  el.password = pws[el.username];
  el.passwordConfirm = pws[el.username];
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.log('ERROR connecting to DB: ', err);
  });

async function insertData() {
  await Product.create({ name: 'website' });

  // Note - Bulk create doesn't automatically set `createdAt` when `validate` is set to true.
  // Options:
  // 1) Add to JSON data, 2) Loop over accounts and manually call new Date(), 3) Pass `fields` array
  await Account.bulkCreate(accounts, {
    individualHooks: true,
    validate: true,
    fields: [
      'username',
      'firstName',
      'lastName',
      'email',
      'role',
      'active',
      'accountUid',
    ],
  });

  await Account.update(
    { activationToken: null, activationExpires: null },
    { where: { active: true } }
  );

  await ProductRequest.bulkCreate(productRequests, {
    validate: true,
    fields: [
      'productId',
      'title',
      'category',
      'upvotes',
      'status',
      'description',
      'accountUid',
    ],
  });

  await Comment.bulkCreate(comments);

  console.log('Successfully inserted test data');
}

async function syncDB(options?: SyncOptions) {
  if (!options) options = {};

  try {
    // 1) Setup tables
    await sequelize.sync(options);

    // 2) Add triggers
    await createUpvoteTriggers(sequelize);
    await createProductRequestTriggers(sequelize);
    await createCommentTriggers(sequelize);

    // 3) Add data
    await insertData();
    console.log('--- Finished setting up DB ---');
  } catch (err) {
    console.log('There was an error syncing models: ', err);
  }
  await sequelize.close();
}

async function resetData() {
  try {
    await sequelize.truncate({
      cascade: true,
      restartIdentity: true,
    });
    console.log('Successfully reset table data');

    await insertData();
  } catch (err) {
    console.log('There was an error resetting table data: ', err);
  }
  await sequelize.close();
}

async function rebuildTriggers() {
  try {
    await createUpvoteTriggers(sequelize);
    await createProductRequestTriggers(sequelize);
    await createCommentTriggers(sequelize);
  } catch (err) {
    console.log('Error rebuilding triggers: ', err);
  }
  await sequelize.close();
}

// Ex. `npm run sync -- --rebuild`
const option = process.argv[2];
if (option === '--create') syncDB();
else if (option === '--rebuild') syncDB({ force: true });
else if (option === '--alter') syncDB({ alter: true });
else if (option === '--resetData') resetData();
else if (option === '--rebuildTriggers') rebuildTriggers();
