import { Request, Response, NextFunction } from 'express';
import { AccountModel } from '../src/models/accountModel';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NODE_ENV: 'production' | 'dev';
      /**
       * CDN URL. Used in cors whitelist.
       */
      EDGE_URL: string;
      /**
       * Main url used for the app.
       */
      DOMAIN: string;
      //
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY;
      //
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_COOKIE_EXPIRES_IN: string;
      //
      SAME_SITE: 'lax' | 'strict' | 'none';
      HEROKUAPP_HOST: string;
      //
      EMAIL_FROM: string;
      SENDGRID_USERNAME: string;
      SENDGRID_PASSWORD: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
    }
  }

  namespace Express {
    interface Request {
      user?: AccountModel;

      /**
       * Property is set by `isCreatorOrAdmin` middleware
       */
      includeUserId?: boolean;
    }
  }
}

export {};
