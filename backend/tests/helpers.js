import request from 'supertest';
import app from '../src/app.js';
import { getOutbox } from '../src/services/emailService.js';

export const createAgent = () => request.agent(app);

export const getCsrfToken = async (agent) => {
  const response = await agent.get('/api/auth/csrf').expect(200);
  return response.body.data.csrfToken;
};

export const sendWithCsrf = (agent, method, path, csrfToken, body) =>
  agent[method](path).set('X-CSRF-Token', csrfToken).send(body);

export const registerUser = async (agent, overrides = {}) => {
  const csrfToken = await getCsrfToken(agent);
  const payload = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'StrongPass1',
    ...overrides,
  };

  const response = await sendWithCsrf(agent, 'post', '/api/auth/register', csrfToken, payload);

  return { response, csrfToken, payload };
};

export const verifyUser = async (agent, email) => {
  const csrfToken = await getCsrfToken(agent);
  const otp = latestOtp();

  const response = await sendWithCsrf(agent, 'post', '/api/auth/verify-email', csrfToken, {
    email,
    otp,
  });

  return { response, csrfToken, otp };
};

export const loginUser = async (agent, email, password = 'StrongPass1') => {
  const csrfToken = await getCsrfToken(agent);
  const response = await sendWithCsrf(agent, 'post', '/api/auth/login', csrfToken, {
    email,
    password,
  });

  return { response, csrfToken };
};

export const latestOtp = () => {
  const email = [...getOutbox()].reverse().find((message) => message.subject.includes('code'));

  if (!email) {
    throw new Error('No OTP email found in the test outbox.');
  }

  const match = email.text.match(/\b(\d{6})\b/);

  if (!match) {
    throw new Error('No OTP found in the latest email.');
  }

  return match[1];
};

export const registerAndVerify = async (agent, overrides = {}) => {
  const { response, payload } = await registerUser(agent, overrides);
  const verification = await verifyUser(agent, payload.email);

  return { response, payload, verification };
};

export const loginVerifiedUser = async (agent, overrides = {}) => {
  const { payload } = await registerAndVerify(agent, overrides);
  const login = await loginUser(agent, payload.email, payload.password);

  return { payload, login };
};
