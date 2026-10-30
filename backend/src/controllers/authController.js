import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  clearCsrfCookie,
  clearSessionCookie,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '../utils/cookies.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { getSessionToken } from '../middleware/authenticate.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return sendCreated(res, {
    message: 'Account created. Check your email for the verification code.',
    data: result,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body);

  return sendSuccess(res, {
    message: 'Email verified successfully. You can now sign in.',
    data: { user },
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendVerificationOtp(req.body);

  return sendSuccess(res, {
    message: result.message,
    data: { retryAfter: result.retryAfter },
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    ...req.body,
    userAgent: req.get('user-agent') || '',
  });

  const maxAge = Math.max(0, result.expiresAt.getTime() - Date.now());
  res.cookie(SESSION_COOKIE, result.token, sessionCookieOptions(maxAge));

  return sendSuccess(res, {
    message: 'Signed in successfully.',
    data: {
      user: result.user,
      expiresAt: result.expiresAt,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getSessionToken(req));
  clearSessionCookie(res);
  clearCsrfCookie(res);

  return sendSuccess(res, { message: 'Signed out successfully.' });
});

export const me = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: 'Authenticated user loaded.',
    data: { user: authService.getMe(req.user) },
  }),
);

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return sendSuccess(res, {
    message: result.message,
    data: { retryAfter: result.retryAfter },
  });
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyResetOtp(req.body);

  return sendSuccess(res, {
    message: 'Code verified. Create your new password.',
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  clearSessionCookie(res);

  return sendSuccess(res, {
    message: result.message,
  });
});
