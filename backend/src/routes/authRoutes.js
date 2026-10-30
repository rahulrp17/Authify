import { Router } from 'express';
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resendOtp,
  resetPassword,
  verifyEmail,
  verifyResetOtp,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { issueCsrfToken } from '../middleware/csrf.js';
import {
  authLimiter,
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiters.js';
import { validateBody } from '../middleware/validate.js';
import {
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
} from '../validators/authValidators.js';

const router = Router();

router.get('/csrf', issueCsrfToken);

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/verify-email', otpLimiter, validateBody(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', otpLimiter, validateBody(emailOnlySchema), resendOtp);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

router.post('/forgot-password', passwordResetLimiter, validateBody(emailOnlySchema), forgotPassword);
router.post('/verify-reset-otp', otpLimiter, validateBody(verifyResetOtpSchema), verifyResetOtp);
router.post('/reset-password', passwordResetLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;
