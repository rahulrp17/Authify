import { env } from '../config/env.js';
import { OtpToken, OTP_PURPOSES } from '../models/OtpToken.js';
import { AppError } from '../utils/AppError.js';
import { generateOtp, hashOtp, safeCompareHash } from '../utils/crypto.js';

const invalidCodeError = () =>
  new AppError(400, 'The code is invalid or has expired.', 'INVALID_OTP');

const tooManyAttemptsError = () =>
  new AppError(429, 'Too many invalid attempts. Request a new code.', 'OTP_ATTEMPTS_EXCEEDED');

export const createOtp = async ({ user, purpose }) => {
  const now = new Date();
  const existing = await OtpToken.findOne({ user: user._id, purpose });

  if (existing) {
    const cooldownMs = env.otpResendSeconds * 1000;
    const elapsedMs = now.getTime() - existing.lastSentAt.getTime();

    if (elapsedMs < cooldownMs) {
      return {
        created: false,
        otp: null,
        retryAfter: Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000)),
      };
    }
  }

  const otp = generateOtp();
  const codeHash = hashOtp(otp);
  const expiresAt = new Date(now.getTime() + env.otpExpiresMinutes * 60 * 1000);

  await OtpToken.findOneAndUpdate(
    { user: user._id, purpose },
    {
      $set: {
        email: user.email,
        codeHash,
        expiresAt,
        attempts: 0,
        maxAttempts: env.otpMaxAttempts,
        lastSentAt: now,
        consumedAt: null,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return {
    created: true,
    otp,
    retryAfter: env.otpResendSeconds,
  };
};

export const verifyOtp = async ({ user, purpose, otp, consume = true }) => {
  const record = await OtpToken.findOne({
    user: user._id,
    purpose,
  }).select('+codeHash');

  if (!record) {
    throw invalidCodeError();
  }

  if (record.consumedAt || record.expiresAt.getTime() <= Date.now()) {
    await OtpToken.deleteOne({ _id: record._id });
    throw invalidCodeError();
  }

  if (record.attempts >= record.maxAttempts) {
    await OtpToken.deleteOne({ _id: record._id });
    throw tooManyAttemptsError();
  }

  if (!safeCompareHash(otp, record.codeHash)) {
    record.attempts += 1;

    if (record.attempts >= record.maxAttempts) {
      await OtpToken.deleteOne({ _id: record._id });
      throw tooManyAttemptsError();
    }

    await record.save();
    throw invalidCodeError();
  }

  if (consume) {
    await OtpToken.deleteOne({ _id: record._id });
  }

  return record;
};

export const consumeResetOtp = async ({ otpId, userId }) => {
  const record = await OtpToken.findOneAndDelete({
    _id: otpId,
    user: userId,
    purpose: OTP_PURPOSES.PASSWORD_RESET,
    consumedAt: { $ne: null },
  });

  if (!record) {
    throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN');
  }

  return record;
};

export const deleteOtp = async (userId, purpose) => {
  await OtpToken.deleteOne({ user: userId, purpose });
};

export const deleteAllOtps = async (userId) => {
  await OtpToken.deleteMany({ user: userId });
};

export const OTP_PURPOSE = OTP_PURPOSES;
