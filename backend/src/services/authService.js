import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { serializeUser } from '../utils/serializeUser.js';
import * as emailService from './emailService.js';
import * as otpService from './otpService.js';
import * as tokenService from './tokenService.js';

const DUMMY_HASH = bcrypt.hashSync('authify-dummy-password-never-used', env.bcryptRounds);

const hashPassword = (password) => bcrypt.hash(password, env.bcryptRounds);

const safeSend = async (operation, context) => {
  try {
    await operation();
    return true;
  } catch (error) {
    console.error(`[email] ${context} failed:`, error.message);
    return false;
  }
};

const genericEmailMessage =
  'If an account exists for that email, a verification code has been sent.';

export const register = async ({ fullName, email, password }) => {
  const existingUser = await User.exists({ email });

  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists.', 'EMAIL_IN_USE');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    password: passwordHash,
    isAccountVerified: false,
    passwordChangedAt: new Date(),
  });

  const otpResult = await otpService.createOtp({
    user,
    purpose: otpService.OTP_PURPOSE.EMAIL_VERIFICATION,
  });

  if (otpResult.created) {
    await safeSend(
      () =>
        emailService.sendVerificationOtpEmail({
          to: user.email,
          name: user.fullName,
          otp: otpResult.otp,
        }),
      'verification OTP email',
    );
  }

  return {
    user: serializeUser(user),
    verificationRequired: true,
  };
};

export const login = async ({ email, password, remember, userAgent }) => {
  const user = await User.findOne({ email }).select('+password');
  const passwordMatches = await bcrypt.compare(password, user?.password || DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  }

  if (!user.isAccountVerified) {
    throw new AppError(
      403,
      'Verify your email before signing in.',
      'EMAIL_NOT_VERIFIED',
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const { token, session, expiresAt } = await tokenService.createSession(user, {
    remember,
    userAgent,
  });

  return {
    user: serializeUser(user),
    token,
    session,
    expiresAt,
  };
};

export const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(400, 'The code is invalid or has expired.', 'INVALID_OTP');
  }

  if (user.isAccountVerified) {
    await otpService.deleteOtp(user._id, otpService.OTP_PURPOSE.EMAIL_VERIFICATION);
    return serializeUser(user);
  }

  await otpService.verifyOtp({
    user,
    purpose: otpService.OTP_PURPOSE.EMAIL_VERIFICATION,
    otp,
    consume: true,
  });

  user.isAccountVerified = true;
  await user.save();

  await safeSend(
    () => emailService.sendWelcomeEmail({ to: user.email, name: user.fullName }),
    'welcome email',
  );

  return serializeUser(user);
};

export const resendVerificationOtp = async ({ email }) => {
  const user = await User.findOne({ email });

  if (user && !user.isAccountVerified) {
    const otpResult = await otpService.createOtp({
      user,
      purpose: otpService.OTP_PURPOSE.EMAIL_VERIFICATION,
    });

    if (otpResult.created) {
      await safeSend(
        () =>
          emailService.sendVerificationOtpEmail({
            to: user.email,
            name: user.fullName,
            otp: otpResult.otp,
          }),
        'verification OTP email',
      );
    }
  }

  return {
    message: genericEmailMessage,
    retryAfter: env.otpResendSeconds,
  };
};

export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  if (user) {
    const otpResult = await otpService.createOtp({
      user,
      purpose: otpService.OTP_PURPOSE.PASSWORD_RESET,
    });

    if (otpResult.created) {
      await safeSend(
        () =>
          emailService.sendResetOtpEmail({
            to: user.email,
            name: user.fullName,
            otp: otpResult.otp,
          }),
        'password reset OTP email',
      );
    }
  }

  return {
    message: 'If an account exists for that email, a password reset code has been sent.',
    retryAfter: env.otpResendSeconds,
  };
};

export const verifyResetOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(400, 'The code is invalid or has expired.', 'INVALID_OTP');
  }

  const otpRecord = await otpService.verifyOtp({
    user,
    purpose: otpService.OTP_PURPOSE.PASSWORD_RESET,
    otp,
    consume: false,
  });

  const { token, expiresAt } = tokenService.signResetToken(user, otpRecord);

  otpRecord.consumedAt = new Date();
  otpRecord.expiresAt = expiresAt;
  await otpRecord.save();

  return { resetToken: token };
};

export const resetPassword = async ({ resetToken, newPassword, email }) => {
  const payload = tokenService.verifyResetToken(resetToken);
  const user = await User.findById(payload.sub);

  if (!user || (email && user.email !== email)) {
    throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN');
  }

  await otpService.consumeResetOtp({
    otpId: payload.otpId,
    userId: user._id,
  });

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  await tokenService.revokeAllSessions(user._id);
  await safeSend(
    () =>
      emailService.sendPasswordResetConfirmationEmail({
        to: user.email,
        name: user.fullName,
      }),
    'password reset confirmation email',
  );

  return { message: 'Password updated successfully.' };
};

export const getMe = (user) => serializeUser(user);

export const logout = async (token) => {
  if (!token) return;

  try {
    const payload = tokenService.verifySessionToken(token);
    await tokenService.revokeSession(payload.jti);
  } catch {
    // Logout is intentionally idempotent. The cookie is cleared by the controller.
  }
};

export const updateProfile = async (user, { fullName, avatar }) => {
  user.fullName = fullName;

  if (avatar !== undefined) {
    user.avatar = avatar || '';
  }

  await user.save();

  return serializeUser(user);
};

export const changePassword = async ({
  user,
  currentPassword,
  newPassword,
  currentJti,
}) => {
  const userWithPassword = await User.findById(user._id).select('+password');

  if (!userWithPassword) {
    throw new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }

  const currentPasswordMatches = await bcrypt.compare(
    currentPassword,
    userWithPassword.password,
  );

  if (!currentPasswordMatches) {
    throw new AppError(401, 'Current password is incorrect.', 'CURRENT_PASSWORD_INCORRECT');
  }

  const samePassword = await bcrypt.compare(newPassword, userWithPassword.password);

  if (samePassword) {
    throw new AppError(
      400,
      'New password must be different from the current password.',
      'PASSWORD_UNCHANGED',
    );
  }

  userWithPassword.password = await hashPassword(newPassword);
  userWithPassword.passwordChangedAt = new Date();
  await userWithPassword.save();

  await tokenService.revokeAllSessions(user._id, { exceptJti: currentJti });
  await safeSend(
    () =>
      emailService.sendSecurityNotificationEmail({
        to: user.email,
        name: user.fullName,
        action: 'Your password was changed.',
      }),
    'password change notification email',
  );

  return { message: 'Password changed successfully.' };
};

export const deleteAccount = async ({ user, password }) => {
  const userWithPassword = await User.findById(user._id).select('+password');

  if (!userWithPassword) {
    throw new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }

  const passwordMatches = await bcrypt.compare(password, userWithPassword.password);

  if (!passwordMatches) {
    throw new AppError(401, 'Password is incorrect.', 'INVALID_PASSWORD');
  }

  await safeSend(
    () =>
      emailService.sendSecurityNotificationEmail({
        to: user.email,
        name: user.fullName,
        action: 'Your AUTHIFY account was deleted.',
      }),
    'account deletion notification email',
  );

  await Promise.all([
    otpService.deleteAllOtps(user._id),
    Session.deleteMany({ user: user._id }),
    User.deleteOne({ _id: user._id }),
  ]);

  return { message: 'Account deleted successfully.' };
};

export const getSessions = async (user, currentJti) =>
  tokenService.getActiveSessions(user._id, currentJti);

export const revokeSession = async (user, sessionId, currentJti) => {
  await tokenService.revokeSessionById(user._id, sessionId, currentJti);
  return { message: 'Session revoked successfully.' };
};
