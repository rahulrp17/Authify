import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { AppError } from '../utils/AppError.js';

const ISSUER = 'authify-api';
const AUDIENCE = 'authify-client';

const sign = (payload, expiresIn) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

const decodeExpiry = (token) => {
  const decoded = jwt.decode(token);
  return new Date(decoded.exp * 1000);
};

export const createSession = async (user, { remember = false, userAgent = '' } = {}) => {
  const jti = randomUUID();
  const expiresIn = remember ? env.jwtRememberExpiresIn : env.jwtExpiresIn;
  const token = sign(
    {
      sub: user._id.toString(),
      jti,
      type: 'session',
    },
    expiresIn,
  );
  const expiresAt = decodeExpiry(token);

  const session = await Session.create({
    user: user._id,
    jti,
    expiresAt,
    userAgent: String(userAgent || '').slice(0, 300),
  });

  return { token, session, expiresAt };
};

export const verifySessionToken = (token) => {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (payload.type !== 'session' || !payload.sub || !payload.jti) {
      throw new Error('Invalid token payload');
    }

    return payload;
  } catch {
    throw new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }
};

export const signResetToken = (user, otpRecord) => {
  const token = sign(
    {
      sub: user._id.toString(),
      otpId: otpRecord._id.toString(),
      jti: randomUUID(),
      type: 'password_reset',
    },
    env.resetTokenExpiresIn,
  );

  return {
    token,
    expiresAt: decodeExpiry(token),
  };
};

export const verifyResetToken = (token) => {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (payload.type !== 'password_reset' || !payload.sub || !payload.otpId) {
      throw new Error('Invalid reset token payload');
    }

    return payload;
  } catch {
    throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN');
  }
};

export const revokeSession = async (jti) => {
  if (!jti) return;

  await Session.updateOne(
    { jti, revokedAt: null },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export const revokeAllSessions = async (userId, { exceptJti } = {}) => {
  const filter = {
    user: userId,
    revokedAt: null,
    ...(exceptJti ? { jti: { $ne: exceptJti } } : {}),
  };

  await Session.updateMany(filter, {
    $set: {
      revokedAt: new Date(),
    },
  });
};

export const getActiveSessions = async (userId, currentJti) => {
  const sessions = await Session.find({
    user: userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();

  return sessions.map((session) => ({
    id: session._id.toString(),
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
    userAgent: session.userAgent,
    current: session.jti === currentJti,
  }));
};

export const revokeSessionById = async (userId, sessionId, currentJti) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new AppError(404, 'Session not found.', 'SESSION_NOT_FOUND');
  }

  const session = await Session.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session || session.revokedAt) {
    throw new AppError(404, 'Session not found.', 'SESSION_NOT_FOUND');
  }

  if (session.jti === currentJti) {
    throw new AppError(400, 'Use logout to end the current session.', 'CURRENT_SESSION');
  }

  session.revokedAt = new Date();
  await session.save();

  return session;
};
