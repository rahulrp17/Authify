import 'dotenv/config';
import { randomBytes } from 'node:crypto';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const requiredSecret = (name, fallbackLength = 32) => {
  const value = process.env[name];

  if (value && value.length >= 32) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} must be set to at least 32 characters in production.`);
  }

  return randomBytes(fallbackLength).toString('hex');
};

const number = (name, fallback, { min, max } = {}) => {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  const value = Number.isFinite(parsed) ? parsed : fallback;

  if (min !== undefined && value < min) {
    throw new Error(`${name} must be at least ${min}.`);
  }

  if (max !== undefined && value > max) {
    throw new Error(`${name} must be at most ${max}.`);
  }

  return value;
};

const boolean = (name, fallback) => {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === 'true';
};

const clientUrl = process.env.CLIENT_URL || (isProduction ? '' : 'http://localhost:5173');

if (isProduction && !clientUrl) {
  throw new Error('CLIENT_URL must be set in production.');
}

const clientUrls = clientUrl
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const smtpHost = process.env.SMTP_HOST || '';
const emailFromName = (process.env.EMAIL_FROM_NAME || 'AUTHIFY').trim();
const emailFromAddress = (process.env.EMAIL_FROM_ADDRESS || '').trim();
const legacyEmailFrom = (process.env.EMAIL_FROM || '').trim();
const emailFrom =
  emailFromAddress
    ? `${emailFromName} <${emailFromAddress}>`
    : legacyEmailFrom || 'AUTHIFY <no-reply@authify.local>';

if (isProduction && !smtpHost) {
  throw new Error('SMTP_HOST must be set in production.');
}

if (isProduction && !emailFromAddress && !legacyEmailFrom) {
  throw new Error('EMAIL_FROM_ADDRESS must be set in production.');
}

if (
  emailFromAddress &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromAddress)
) {
  throw new Error('EMAIL_FROM_ADDRESS must be a valid email address.');
}

const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be one of: lax, strict, none.');
}

if (!isProduction && cookieSameSite === 'none') {
  throw new Error('SameSite=None cookies require HTTPS. Use lax for local development.');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isTest,
  port: number('PORT', 5000, { min: 1, max: 65535 }),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/authify',
  jwtSecret: requiredSecret('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '7d',
  resetTokenExpiresIn: process.env.RESET_TOKEN_EXPIRES_IN || '10m',
  cookieSecret: requiredSecret('COOKIE_SECRET'),
  cookieSameSite,
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  otpHashSecret: requiredSecret('OTP_HASH_SECRET'),
  otpExpiresMinutes: number('OTP_EXPIRES_MINUTES', 10, { min: 5, max: 60 }),
  otpMaxAttempts: number('OTP_MAX_ATTEMPTS', 5, { min: 3, max: 10 }),
  otpResendSeconds: number('OTP_RESEND_SECONDS', 60, { min: 30, max: 300 }),
  bcryptRounds: number('BCRYPT_ROUNDS', 12, { min: 10, max: 14 }),
  clientUrl,
  clientUrls,
  smtpHost,
  smtpPort: number('SMTP_PORT', 587, { min: 1, max: 65535 }),
  smtpSecure: boolean('SMTP_SECURE', false),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom,
  emailFromName,
  emailFromAddress: emailFromAddress || undefined,
  rateLimitDisabled: boolean('RATE_LIMIT_DISABLED', isTest),
};
