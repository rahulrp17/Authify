import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email('Enter a valid email address.')
  .max(254, 'Email is too long.')
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

const otp = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit code.');

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name must be at most 80 characters.'),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.').max(128),
  remember: z.boolean().optional().default(false),
});

export const verifyEmailSchema = z.object({
  email,
  otp,
});

export const emailOnlySchema = z.object({
  email,
});

export const verifyResetOtpSchema = z.object({
  email,
  otp,
});

export const resetPasswordSchema = z.object({
  email: email.optional(),
  resetToken: z.string().min(20, 'Reset token is invalid.'),
  newPassword: password,
});
