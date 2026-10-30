import { env } from '../config/env.js';

export const SESSION_COOKIE = 'authify_session';
export const CSRF_COOKIE = 'authify_csrf';

const baseCookieOptions = () => ({
  secure: env.isProduction,
  sameSite: env.cookieSameSite,
  path: '/',
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
});

export const sessionCookieOptions = (maxAge) => ({
  ...baseCookieOptions(),
  httpOnly: true,
  maxAge,
});

export const csrfCookieOptions = (maxAge) => ({
  ...baseCookieOptions(),
  httpOnly: false,
  signed: true,
  maxAge,
});

export const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE, {
    ...baseCookieOptions(),
    httpOnly: true,
  });
};

export const clearCsrfCookie = (res) => {
  res.clearCookie(CSRF_COOKIE, {
    ...baseCookieOptions(),
    httpOnly: false,
    signed: true,
  });
};
