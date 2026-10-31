import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import {
  passwordResetConfirmationEmail,
  resetOtpEmail,
  securityNotificationEmail,
  verificationOtpEmail,
  welcomeEmail,
} from '../templates/emails.js';

const outbox = [];

const createTransport = () => {
  if (!env.smtpHost) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    ...(env.smtpUser
      ? {
          auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
          },
        }
      : {}),
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
};

const transport = createTransport();

const sendWithResend = async ({ to, subject, html, text }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [to],
      subject,
      html,
      ...(text ? { text } : {}),
    }),
    signal: AbortSignal.timeout(10000),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message || `Resend request failed with status ${response.status}.`,
    );
  }

  return payload;
};

const sendMail = async ({ to, subject, html, text }) => {
  const useResend = Boolean(env.resendApiKey) && !env.isTest;

  const info = useResend
    ? await sendWithResend({ to, subject, html, text })
    : await transport.sendMail({
        from: env.emailFrom,
        to,
        subject,
        html,
        text,
        disableFileAccess: true,
        disableUrlAccess: true,
      });

  if (env.isTest) {
    outbox.push({ to, subject, html, text, info });
  }

  if (!env.isProduction && !env.smtpHost && !useResend) {
    console.info(`[email] Captured "${subject}" for ${to} (SMTP not configured)`);
  }

  return info;
};

export const getOutbox = () => outbox;

export const clearOutbox = () => {
  outbox.length = 0;
};

export const sendWelcomeEmail = async ({ to, name }) => {
  const message = welcomeEmail({ name });
  return sendMail({ to, ...message });
};

export const sendVerificationOtpEmail = async ({ to, name, otp }) => {
  const message = verificationOtpEmail({ name, otp });
  return sendMail({ to, ...message });
};

export const sendResetOtpEmail = async ({ to, name, otp }) => {
  const message = resetOtpEmail({ name, otp });
  return sendMail({ to, ...message });
};

export const sendPasswordResetConfirmationEmail = async ({ to, name }) => {
  const message = passwordResetConfirmationEmail({ name });
  return sendMail({ to, ...message });
};

export const sendSecurityNotificationEmail = async ({ to, name, action }) => {
  const message = securityNotificationEmail({ name, action });
  return sendMail({ to, ...message });
};
