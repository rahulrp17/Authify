import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const noopLimiter = (_req, _res, next) => next();

const createLimiter = ({ windowMs, limit, message, code }) => {
  if (env.rateLimitDisabled) {
    return noopLimiter;
  }

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError(429, message, code));
    },
    skip: (req) => req.method === 'OPTIONS',
  });
};

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: 'Too many requests. Please try again later.',
  code: 'RATE_LIMITED',
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Too many authentication attempts. Please try again later.',
  code: 'AUTH_RATE_LIMITED',
});

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many login attempts. Please try again later.',
  code: 'LOGIN_RATE_LIMITED',
});

export const otpLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many code requests. Please try again later.',
  code: 'OTP_RATE_LIMITED',
});

export const passwordResetLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: 'Too many password reset attempts. Please try again later.',
  code: 'RESET_RATE_LIMITED',
});
