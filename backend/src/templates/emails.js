const BRAND = {
  voidBlack: '#101010',
  darkSurface: '#1A1A1A',
  cardSurface: '#242424',
  acidLime: '#39FF14',
  hotPink: '#FF00E5',
  infernoOrange: '#FF5C00',
  voltYellow: '#B6FF00',
  electricPurple: '#7000FF',
  white: '#FFFFFF',
  muted: '#A3A3A3',
  border: '#3A3A3A',
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const layout = ({ title, preheader, name, content }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.voidBlack};font-family:Inter,Arial,sans-serif;color:${BRAND.white};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.voidBlack};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:${BRAND.darkSurface};border:2px solid ${BRAND.border};">
            <tr>
              <td style="padding:28px 28px 18px;border-bottom:2px solid ${BRAND.border};">
                <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${BRAND.acidLime};font-weight:700;">AUTHIFY // IDENTITY CONTROL</div>
                <h1 style="margin:12px 0 0;font-family:'Space Grotesk',Arial,sans-serif;font-size:32px;line-height:1.05;letter-spacing:-1.5px;color:${BRAND.white};text-transform:uppercase;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${BRAND.white};">Hey ${escapeHtml(name)},</p>
                ${content}
                <p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">If you did not request this action, secure your account immediately and contact support.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:2px solid ${BRAND.border};background:${BRAND.voidBlack};">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                  <strong style="color:${BRAND.acidLime};">AUTHIFY</strong> — YOUR IDENTITY. YOUR RULES.<br />
                  This is an automated security message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const otpBlock = (otp) => `
  <div style="margin:24px 0;padding:22px;border:2px solid ${BRAND.acidLime};background:${BRAND.voidBlack};text-align:center;">
    <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">YOUR ONE-TIME CODE</div>
    <div style="margin-top:12px;font-family:'Space Grotesk',Arial,sans-serif;font-size:40px;line-height:1;letter-spacing:10px;font-weight:800;color:${BRAND.acidLime};">${escapeHtml(otp)}</div>
    <div style="margin-top:12px;font-size:12px;color:${BRAND.muted};">Expires in 10 minutes. Never share this code.</div>
  </div>`;

export const welcomeEmail = ({ name }) => ({
  subject: 'Welcome to AUTHIFY',
  html: layout({
    title: 'Your identity is live',
    preheader: 'Welcome to AUTHIFY. Verify your email to activate your account.',
    name,
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.white};">Your AUTHIFY account has been created. You are now part of a platform built around one idea: <strong style="color:${BRAND.acidLime};">your identity should answer to you.</strong></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">Verify your email using the one-time code we sent separately, then sign in to take control of your account.</p>
    `,
  }),
  text: `Welcome to AUTHIFY, ${name}. Verify your email to activate your account.`,
});

export const verificationOtpEmail = ({ name, otp }) => ({
  subject: 'AUTHIFY verification code',
  html: layout({
    title: "Prove it's you",
    preheader: 'Use your one-time code to verify your AUTHIFY email address.',
    name,
    content: `
      <p style="margin:0;font-size:16px;line-height:1.6;color:${BRAND.white};">Enter this code to verify your email address and activate your account.</p>
      ${otpBlock(otp)}
      <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted};">The code can be used once. If it expires, request a new one from the verification screen.</p>
    `,
  }),
  text: `Your AUTHIFY verification code is ${otp}. It expires in 10 minutes. Never share this code.`,
});

export const resetOtpEmail = ({ name, otp }) => ({
  subject: 'AUTHIFY password reset code',
  html: layout({
    title: 'Reset your access',
    preheader: 'Use your one-time code to reset your AUTHIFY password.',
    name,
    content: `
      <p style="margin:0;font-size:16px;line-height:1.6;color:${BRAND.white};">We received a request to reset your password. Use this code to continue.</p>
      ${otpBlock(otp)}
      <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted};">If you did not request a password reset, you can ignore this email. Your password will not change.</p>
    `,
  }),
  text: `Your AUTHIFY password reset code is ${otp}. It expires in 10 minutes. Never share this code.`,
});

export const passwordResetConfirmationEmail = ({ name }) => ({
  subject: 'AUTHIFY password changed',
  html: layout({
    title: 'Access updated',
    preheader: 'Your AUTHIFY password was reset successfully.',
    name,
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.white};">Your password was reset successfully. All previous sessions have been revoked.</p>
      <div style="padding:16px;border-left:4px solid ${BRAND.acidLime};background:${BRAND.voidBlack};">
        <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted};">You can now sign in with your new password.</p>
      </div>
    `,
  }),
  text: 'Your AUTHIFY password was reset successfully. All previous sessions have been revoked.',
});

export const securityNotificationEmail = ({ name, action }) => ({
  subject: 'AUTHIFY security notification',
  html: layout({
    title: 'Security update',
    preheader: `Security change on your AUTHIFY account: ${action}.`,
    name,
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.white};">A security-sensitive change was made to your account:</p>
      <div style="padding:16px;border-left:4px solid ${BRAND.hotPink};background:${BRAND.voidBlack};">
        <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.white};font-weight:700;">${escapeHtml(action)}</p>
      </div>
      <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:${BRAND.muted};">If this was not you, reset your password and contact support immediately.</p>
    `,
  }),
  text: `AUTHIFY security notification: ${action}. If this was not you, reset your password immediately.`,
});
