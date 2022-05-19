const fs = require('fs');
const dotenv = require('dotenv');
const {
  createUpvoteTriggers,
  createProductRequestTriggers,
  createCommentTriggers,
} = require('../database/triggers');

const accounts = JSON.parse(
  fs.readFileSync(`${__dirname}/accounts.json`, 'utf-8')
);
const pws = JSON.parse(
  fs.readFileSync(`${__dirname}/testDataPWs.json`, 'utf-8')
);
const productRequests = JSON.parse(
  fs.readFileSync(`${__dirname}/productRequests.json`, 'utf-8')
);
const comments = JSON.parse(
  fs.readFileSync(`${__dirname}/comments.json`, 'utf-8')
);

accounts.forEach((el) => {
  el.password = pws[el.username];
  el.passwordConfirm = pws[el.username];
});

dotenv.config({ path: './config.env' });

const sequelize = require('../database/sequelize');
require('../database/associations');

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.log('ERROR connecting to DB: ', err);
  });

const { Account, Product, ProductRequest, Comment } = sequelize.models;

async function insertData() {
  await Product.create({ name: 'website' });

  await Account.bulkCreate(accounts, {
    individualHooks: true,
    validate: true,
  });

  await Account.update(
    { activationToken: null, activationExpires: null },
    { where: { active: true } }
  );

  await ProductRequest.bulkCreate(productRequests, {
    validate: true,
  });

  // await Upvote.bulkCreate(demoUpvotes);

  await Comment.bulkCreate(comments);

  console.log('Successfully inserted test data');
}

async function syncDB(options = {}) {
  try {
    await sequelize.sync(options);
    console.log('Successfully synced models. Adding triggers...');

    await createUpvoteTriggers(sequelize);
    await createProductRequestTriggers(sequelize);
    await createCommentTriggers(sequelize);

    console.log('Inserting test data........');
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

async function rebuildTriggers() {
  try {
    // await createUpvoteTriggers(sequelize);
    // await createProductRequestTriggers(sequelize);
    await createCommentTriggers(sequelize);
  } catch (err) {
    console.log('Error rebuilding triggers: ', err);
  }
  await sequelize.close();
}

// Ex. node dev-data/syncModels.js --option
const option = process.argv[2];
if (option === '--create') syncDB();
else if (option === '--rebuild') syncDB({ force: true });
else if (option === '--alter') syncDB({ alter: true });
else if (option === '--resetData') resetData();
else if (option === '--rebuildTriggers') rebuildTriggers();
