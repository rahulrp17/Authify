import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

export const generateOtp = () => String(randomInt(100000, 1000000));

export const hashOtp = (otp) =>
  createHmac('sha256', env.otpHashSecret).update(String(otp)).digest('hex');

export const safeCompare = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const safeCompareHash = (plainOtp, expectedHash) =>
  safeCompare(hashOtp(plainOtp), expectedHash);

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('hex');
