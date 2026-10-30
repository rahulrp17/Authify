import { AppError } from '../utils/AppError.js';

export const notFound = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found.`, 'NOT_FOUND'));
};

const normalizeError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return new AppError(400, 'Invalid JSON payload.', 'INVALID_JSON');
  }

  if (error.name === 'CastError') {
    return new AppError(400, 'Invalid identifier.', 'INVALID_IDENTIFIER');
  }

  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return new AppError(400, 'Validation failed.', 'VALIDATION_ERROR', details);
  }

  if (error.code === 11000) {
    return new AppError(409, 'A record with those details already exists.', 'CONFLICT');
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }

  if (error.type === 'entity.too.large') {
    return new AppError(413, 'Request payload is too large.', 'PAYLOAD_TOO_LARGE');
  }

  return error;
};

export const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode || 500;
  const isOperational = Boolean(normalized.isOperational);

  if (!isOperational || statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, normalized.stack || normalized.message);
  }

  const payload = {
    success: false,
    message: isOperational ? normalized.message : 'Internal server error.',
  };

  if (isOperational && normalized.code) {
    payload.code = normalized.code;
  }

  if (isOperational && normalized.details) {
    payload.errors = normalized.details;
  }

  return res.status(statusCode).json(payload);
};
