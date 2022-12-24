import path from 'path';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from './config/helmetConfig';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import { apiV1 } from './routes';
import type { HttpError } from 'http-errors';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');

  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https')
      return next();

    res.status(403).json({
      status: 'fail',
      message: 'Connection is not secure.',
    });
  });

  app.use(helmet);
}

const whitelist = [
  'https://www.product-feedback-app.com',
  'https://product-feedback-webapp.herokuapp.com',
  process.env.EDGE_URL,
];

const CORS =
  process.env.NODE_ENV === 'production'
    ? cors({
        origin: (origin, cb) => {
          if (!origin || whitelist.indexOf(origin) !== -1) cb(null, true);
          else cb(new AppError('Not allowed by CORS', 400));
        },
        credentials: true,
      })
    : cors();

app.use(CORS);
app.options('*', CORS);

if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));

const parseJSON = express.json({ limit: '20kb' });

app.use('/api', (req, res, next) =>
  parseJSON(req, res, (err?: HttpError) => {
    if (err) {
      console.log(`Received invalid JSON: ${err.body}`);

      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid JSON data' });
    }

    next();
  })
);

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

app.use('/api/v1', apiV1);

if (process.env.NODE_ENV === 'production') {
  const BUILD = path.resolve('client', 'dist');
  const INDEX = path.resolve(BUILD, 'index.html');

  app.use(express.static(BUILD));

  app.get('*', (_, res) => {
    res.sendFile(INDEX);
  });
}

app.all('*', (req, _, next) =>
  next(new AppError(`${req.originalUrl} does not exist on this server`, 404))
);

app.use(globalErrorHandler);

export default app;
