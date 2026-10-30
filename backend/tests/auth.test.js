import { describe, expect, it } from 'vitest';
import {
  createAgent,
  getCsrfToken,
  latestOtp,
  loginUser,
  loginVerifiedUser,
  registerAndVerify,
  registerUser,
  sendWithCsrf,
} from './helpers.js';

describe('AUTHIFY auth API', () => {
  it('reports a healthy API', async () => {
    const agent = createAgent();
    const response = await agent.get('/api/health').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('rejects state-changing requests without a CSRF token', async () => {
    const agent = createAgent();
    const response = await agent.post('/api/auth/register').send({
      fullName: 'No CSRF',
      email: 'no-csrf@example.com',
      password: 'StrongPass1',
    });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('INVALID_CSRF_TOKEN');
  });

  it('registers a user, hashes the password, and sends a verification OTP', async () => {
    const agent = createAgent();
    const { response } = await registerUser(agent);

    expect(response.status).toBe(201);
    expect(response.body.data.verificationRequired).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.user.isAccountVerified).toBe(false);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(latestOtp()).toMatch(/^\d{6}$/);
  });

  it('normalizes email addresses to lowercase', async () => {
    const agent = createAgent();
    const { response } = await registerUser(agent, {
      email: 'MiXeD@Example.COM',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('mixed@example.com');
  });

  it('rejects duplicate email registration', async () => {
    const agent = createAgent();
    await registerUser(agent);

    const { response } = await registerUser(agent);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('EMAIL_IN_USE');
  });

  it('rejects invalid registration input', async () => {
    const agent = createAgent();
    const csrfToken = await getCsrfToken(agent);

    const invalidEmail = await sendWithCsrf(agent, 'post', '/api/auth/register', csrfToken, {
      fullName: 'Test User',
      email: 'not-an-email',
      password: 'StrongPass1',
    });

    const weakPassword = await sendWithCsrf(agent, 'post', '/api/auth/register', csrfToken, {
      fullName: 'Test User',
      email: 'weak@example.com',
      password: 'weak',
    });

    expect(invalidEmail.status).toBe(400);
    expect(invalidEmail.body.code).toBe('VALIDATION_ERROR');
    expect(weakPassword.status).toBe(400);
  });

  it('blocks login until the email is verified', async () => {
    const agent = createAgent();
    const { payload } = await registerUser(agent);
    const { response } = await loginUser(agent, payload.email);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('verifies email with the correct OTP and rejects an incorrect OTP', async () => {
    const agent = createAgent();
    const { payload } = await registerUser(agent);
    const actualOtp = latestOtp();
    const csrfToken = await getCsrfToken(agent);
    const wrongOtp = actualOtp === '000000' ? '111111' : '000000';

    const wrong = await sendWithCsrf(agent, 'post', '/api/auth/verify-email', csrfToken, {
      email: payload.email,
      otp: wrongOtp,
    });

    const correct = await sendWithCsrf(agent, 'post', '/api/auth/verify-email', csrfToken, {
      email: payload.email,
      otp: actualOtp,
    });

    expect(wrong.status).toBe(400);
    expect(correct.status).toBe(200);
    expect(correct.body.data.user.isAccountVerified).toBe(true);
  });

  it('limits repeated invalid OTP attempts', async () => {
    const agent = createAgent();
    const { payload } = await registerUser(agent);
    const actualOtp = latestOtp();
    const csrfToken = await getCsrfToken(agent);
    const wrongOtp = actualOtp === '000000' ? '111111' : '000000';

    let lastResponse;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      lastResponse = await sendWithCsrf(agent, 'post', '/api/auth/verify-email', csrfToken, {
        email: payload.email,
        otp: wrongOtp,
      });
    }

    const afterLimit = await sendWithCsrf(agent, 'post', '/api/auth/verify-email', csrfToken, {
      email: payload.email,
      otp: actualOtp,
    });

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body.code).toBe('OTP_ATTEMPTS_EXCEEDED');
    expect(afterLimit.status).toBe(400);
  });

  it('respects the OTP resend cooldown', async () => {
    const agent = createAgent();
    const { payload } = await registerUser(agent);
    const csrfToken = await getCsrfToken(agent);

    const response = await sendWithCsrf(agent, 'post', '/api/auth/resend-otp', csrfToken, {
      email: payload.email,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.retryAfter).toBeGreaterThan(0);
  });

  it('does not reveal whether an account exists during password reset requests', async () => {
    const agent = createAgent();
    const csrfToken = await getCsrfToken(agent);

    const response = await sendWithCsrf(agent, 'post', '/api/auth/forgot-password', csrfToken, {
      email: 'missing@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.retryAfter).toBeGreaterThan(0);
  });

  it('logs in with a secure HttpOnly cookie and never returns the JWT in the body', async () => {
    const agent = createAgent();
    const { payload } = await registerAndVerify(agent);
    const login = await loginUser(agent, payload.email, payload.password);

    expect(login.response.status).toBe(200);
    expect(login.response.body.data).not.toHaveProperty('token');
    expect(login.response.body.data.user.email).toBe(payload.email);

    const cookies = login.response.headers['set-cookie'].join(';');
    expect(cookies).toContain('authify_session=');
    expect(cookies).toContain('HttpOnly');

    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.data.user.email).toBe(payload.email);
  });

  it('revokes the session on logout', async () => {
    const agent = createAgent();
    const { login } = await loginVerifiedUser(agent);
    const currentCsrf = login.csrfToken;

    const logout = await sendWithCsrf(agent, 'post', '/api/auth/logout', currentCsrf);
    expect(logout.status).toBe(200);

    await agent.get('/api/auth/me').expect(401);
  });

  it('resets the password with a single-use reset token', async () => {
    const agent = createAgent();
    const { payload } = await loginVerifiedUser(agent);
    const csrfToken = await getCsrfToken(agent);

    const forgot = await sendWithCsrf(agent, 'post', '/api/auth/forgot-password', csrfToken, {
      email: payload.email,
    });
    expect(forgot.status).toBe(200);

    const resetOtp = latestOtp();
    const verify = await sendWithCsrf(agent, 'post', '/api/auth/verify-reset-otp', csrfToken, {
      email: payload.email,
      otp: resetOtp,
    });

    expect(verify.status).toBe(200);
    const { resetToken } = verify.body.data;

    const reset = await sendWithCsrf(agent, 'post', '/api/auth/reset-password', csrfToken, {
      resetToken,
      newPassword: 'NewStrongPass2',
    });

    expect(reset.status).toBe(200);

    await agent.get('/api/auth/me').expect(401);

    const reused = await sendWithCsrf(agent, 'post', '/api/auth/reset-password', csrfToken, {
      resetToken,
      newPassword: 'AnotherPass3',
    });

    expect(reused.status).toBe(400);
    expect(reused.body.code).toBe('INVALID_RESET_TOKEN');

    const oldLogin = await loginUser(agent, payload.email, payload.password);
    expect(oldLogin.response.status).toBe(401);

    const newLogin = await loginUser(agent, payload.email, 'NewStrongPass2');
    expect(newLogin.response.status).toBe(200);
  });

  it('rejects an expired or invalid reset token', async () => {
    const agent = createAgent();
    const csrfToken = await getCsrfToken(agent);

    const response = await sendWithCsrf(agent, 'post', '/api/auth/reset-password', csrfToken, {
      resetToken: 'invalid-token-that-is-long-enough-to-pass-shape-validation',
      newPassword: 'NewStrongPass2',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_RESET_TOKEN');
  });
});
