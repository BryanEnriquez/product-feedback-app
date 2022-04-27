const dotenv = require('dotenv');
const {
  createUpvoteTriggers,
  createProductRequestTriggers,
  createCommentTriggers,
} = require('./triggers');
const {
  demoUsers,
  demoProductRequests,
  demoUpvotes,
  demoComments,
} = require('./testData');
dotenv.config({ path: './config.env' });

const sequelize = require('./sequelize');
require('./associations');

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.log('ERROR connecting to DB: ', err);
  });

const { Account, Product, ProductRequest, Upvote, Comment } = sequelize.models;

async function insertData() {
  await Product.create({ name: 'website' });

  await Account.bulkCreate(demoUsers, {
    individualHooks: true,
    validate: true,
  });

  await Account.update({
    activationToken: null,
    activationExpires: null,
  });

  await ProductRequest.bulkCreate(demoProductRequests, {
    validate: true,
  });

  await Upvote.bulkCreate(demoUpvotes);

  await Comment.bulkCreate(demoComments);

  console.log('Successfully inserted demo data');
}

async function syncDB(options = {}) {
  try {
    await sequelize.sync(options);
    console.log('Successfully synced models. Adding triggers...');

    await createUpvoteTriggers(sequelize);
    await createProductRequestTriggers(sequelize);
    await createCommentTriggers(sequelize);

    console.log('Inserting demo data........');
    await insertData();
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

// Ex. node database/syncModels.js --option
const option = process.argv[2];
if (option === '--create') syncDB();
else if (option === '--rebuild') syncDB({ force: true });
else if (option === '--alter') syncDB({ alter: true });
else if (option === '--resetData') resetData();
