// const path = require('path');
const express = require('express');
const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
// const rateLimit = require('express-rate-limit');
// const cookieParser = require('cookie-parser');
// const compression = require('compression');
const helmet = require('./config/helmetConfig');

const app = express();

app.use(helmet);

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
// app.use(cookieParser());

// app.use(compression());

app.get('/', (req, res, next) => {
  res.status(200).json({ message: 'test' });
});

app.use('*', (req, res, next) => {
  const err = `Requested resource ${req.originalUrl} does not exist`;

  res.status(404).json({
    status: 'fail',
    message: err,
  });
});

module.exports = app;
