import { AppError } from '../utils/AppError.js';

export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));

    return next(new AppError(400, 'Please correct the highlighted fields.', 'VALIDATION_ERROR', details));
  }

  req.body = result.data;
  return next();
};
