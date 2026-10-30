import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { CSRF_COOKIE, csrfCookieOptions } from '../utils/cookies.js';
import { randomToken, safeCompare } from '../utils/crypto.js';
import { sendSuccess } from '../utils/response.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const issueCsrfToken = (req, res) => {
  const token = randomToken(32);

  res.cookie(CSRF_COOKIE, token, csrfCookieOptions(2 * 60 * 60 * 1000));

  return sendSuccess(res, {
    message: 'CSRF token issued.',
    data: { csrfToken: token },
  });
};

export const verifyOrigin = (req, _res, next) => {
  const origin = req.get('origin');

  if (!origin || env.clientUrls.includes(origin)) {
    return next();
  }

  return next(new AppError(403, 'Request origin is not allowed.', 'INVALID_ORIGIN'));
};

export const csrfProtection = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.signedCookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || !safeCompare(cookieToken, headerToken)) {
    return next(new AppError(403, 'Invalid CSRF token. Refresh the page and try again.', 'INVALID_CSRF_TOKEN'));
  }

  return next();
};
