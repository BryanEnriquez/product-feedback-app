const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const helmet = require('./config/helmetConfig');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const productRequestRouter = require('./routes/productRequestRoutes');
const commentRouter = require('./routes/commentRoutes');
const upvoteRouter = require('./routes/upvoteRoutes');

const app = express();

app.enable('trust proxy');

const EDGE = process.env.EDGE_URL;

const whitelist = [
  'https://www.product-feedback-app.com',
  EDGE,
  'https://product-feedback-webapp.herokuapp.com',
];

const corsOptions = {
  origin: (origin, cb) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) cb(null, true);
    else cb(new AppError('Not allowed by CORS'), 400);
  },
};

const CORS = process.env.NODE_ENV === 'production' ? cors(corsOptions) : cors();

app.use(CORS);
app.options('*', CORS);

if (process.env.NODE_ENV === 'production') {
  app.use(helmet);

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

if (process.env.NODE_ENV === 'production') {
  app.use(compression());

  app.use(
    '/api',
    rateLimit({
      max: 300,
      windowMs: 15 * 60 * 1000, // 300 requests / 15 mins
      standardHeaders: true,
      message: 'Too many requests from this IP, try again later.',
    })
  );
}

// API
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/productRequests', productRequestRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/upvotes', upvoteRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.all('*', (req, res, next) => {
  const err = new AppError(
    `${req.originalUrl} does not exist on this server`,
    404
  );

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
