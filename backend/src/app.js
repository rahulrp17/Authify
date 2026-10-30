import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { csrfProtection, verifyOrigin } from './middleware/csrf.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(403, 'Request origin is not allowed.', 'INVALID_ORIGIN'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(cookieParser(env.cookieSecret));

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(apiLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AUTHIFY API is running.',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(verifyOrigin);
app.use(csrfProtection);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
