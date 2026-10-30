import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { verifySessionToken } from '../services/tokenService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SESSION_COOKIE } from '../utils/cookies.js';

export const getSessionToken = (req) => req.cookies?.[SESSION_COOKIE] || null;

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = getSessionToken(req);

  if (!token) {
    throw new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }

  const payload = verifySessionToken(token);
  const session = await Session.findOne({
    jti: payload.jti,
    user: payload.sub,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new AppError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }

  if (Date.now() - session.lastUsedAt.getTime() > 5 * 60 * 1000) {
    session.lastUsedAt = new Date();
    await session.save();
  }

  req.user = user;
  req.session = session;
  req.auth = payload;
  next();
});
