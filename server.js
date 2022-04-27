const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const sequelize = require('./database/sequelize.js');
require('./database/associations');

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.log('ERROR connecting to DB: ', err);
  });

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`${process.env.NODE_ENV} server is running on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION. Shutting down.');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down.');
  server.close(() => console.log('PROCESS TERMINATED'));
});
