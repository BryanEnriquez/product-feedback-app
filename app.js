// const path = require('path');
const express = require('express');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
// const compression = require('compression');
// const helmet = require('./config/helmetConfig');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const productRequestRouter = require('./routes/productRequestRoutes');
const commentRouter = require('./routes/commentRoutes');
const upvoteRouter = require('./routes/upvoteRoutes');

const app = express();

app.enable('trust proxy');

// app.use(helmet);

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https')
      return next();

    res
      .status(404)
      .json({ status: 'fail', message: 'Connection is not secure.' });
  });
}

if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));

app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

// app.use(compression());

app.get('/', (req, res, next) => {
  res.status(200).json({ message: 'test' });
});

// API
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/productRequests', productRequestRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/upvotes', upvoteRouter);

app.use('*', (req, res, next) => {
  const err = new AppError(
    `${req.originalUrl} does not exist on this server`,
    404
  );

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
