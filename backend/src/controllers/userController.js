import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearCsrfCookie, clearSessionCookie } from '../utils/cookies.js';
import { sendSuccess } from '../utils/response.js';

export const getProfile = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: 'Profile loaded.',
    data: { user: authService.getMe(req.user) },
  }),
);

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user, req.body);

  return sendSuccess(res, {
    message: 'Profile updated successfully.',
    data: { user },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword({
    user: req.user,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    currentJti: req.session.jti,
  });

  return sendSuccess(res, { message: result.message });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteAccount({
    user: req.user,
    password: req.body.password,
  });

  clearSessionCookie(res);
  clearCsrfCookie(res);

  return sendSuccess(res, { message: result.message });
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getSessions(req.user, req.session.jti);

  return sendSuccess(res, {
    message: 'Active sessions loaded.',
    data: { sessions },
  });
});

export const revokeSession = asyncHandler(async (req, res) => {
  const result = await authService.revokeSession(
    req.user,
    req.params.sessionId,
    req.session.jti,
  );

  return sendSuccess(res, { message: result.message });
});
