import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

const avatar = z
  .string()
  .trim()
  .max(400000, 'Profile image is too large.')
  .refine(
    (value) =>
      value === '' ||
      /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ||
      /^https:\/\/[^\s]+$/.test(value),
    'Profile image must be a PNG, JPEG, WebP, or HTTPS URL.',
  );

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name must be at most 80 characters.'),
  avatar: avatar.nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.').max(128),
  newPassword: password,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required.').max(128),
});
