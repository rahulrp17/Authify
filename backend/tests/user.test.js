import { describe, expect, it } from 'vitest';
import {
  createAgent,
  getCsrfToken,
  loginUser,
  loginVerifiedUser,
  sendWithCsrf,
} from './helpers.js';

describe('AUTHIFY user API', () => {
  it('requires authentication for user endpoints', async () => {
    const agent = createAgent();
    const response = await agent.get('/api/user/profile');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('rejects state-changing user requests without CSRF', async () => {
    const agent = createAgent();
    const { login } = await loginVerifiedUser(agent);

    const response = await agent
      .put('/api/user/profile')
      .send({ fullName: 'No CSRF' });

    expect(response.status).toBe(403);
    expect(login.response.status).toBe(200);
  });

  it('updates the profile name with real persisted data', async () => {
    const agent = createAgent();
    const { login } = await loginVerifiedUser(agent);

    const response = await sendWithCsrf(
      agent,
      'put',
      '/api/user/profile',
      login.csrfToken,
      { fullName: 'Updated Name' },
    );

    expect(response.status).toBe(200);
    expect(response.body.data.user.fullName).toBe('Updated Name');

    const profile = await agent.get('/api/user/profile').expect(200);
    expect(profile.body.data.user.fullName).toBe('Updated Name');
  });

  it('updates and clears the profile image', async () => {
    const agent = createAgent();
    const { login } = await loginVerifiedUser(agent);
    const avatar =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl9sAAAAASUVORK5CYII=';

    const updated = await sendWithCsrf(
      agent,
      'put',
      '/api/user/profile',
      login.csrfToken,
      { fullName: 'Avatar User', avatar },
    );

    expect(updated.status).toBe(200);
    expect(updated.body.data.user.avatar).toBe(avatar);

    const profile = await agent.get('/api/user/profile').expect(200);
    expect(profile.body.data.user.avatar).toBe(avatar);

    const cleared = await sendWithCsrf(
      agent,
      'put',
      '/api/user/profile',
      login.csrfToken,
      { fullName: 'Avatar User', avatar: '' },
    );

    expect(cleared.status).toBe(200);
    expect(cleared.body.data.user.avatar).toBeNull();
  });

  it('changes the password only after verifying the current password', async () => {
    const agent = createAgent();
    const { payload, login } = await loginVerifiedUser(agent);

    const wrong = await sendWithCsrf(
      agent,
      'put',
      '/api/user/change-password',
      login.csrfToken,
      {
        currentPassword: 'WrongPass1',
        newPassword: 'NewStrongPass2',
      },
    );

    expect(wrong.status).toBe(401);
    expect(wrong.body.code).toBe('CURRENT_PASSWORD_INCORRECT');

    const changed = await sendWithCsrf(
      agent,
      'put',
      '/api/user/change-password',
      login.csrfToken,
      {
        currentPassword: payload.password,
        newPassword: 'NewStrongPass2',
      },
    );

    expect(changed.status).toBe(200);
    await agent.get('/api/auth/me').expect(200);

    const oldLogin = await loginUser(agent, payload.email, payload.password);
    expect(oldLogin.response.status).toBe(401);

    const newLogin = await loginUser(agent, payload.email, 'NewStrongPass2');
    expect(newLogin.response.status).toBe(200);
  });

  it('lists active sessions and revokes another session', async () => {
    const agentA = createAgent();
    const agentB = createAgent();
    const { payload, login } = await loginVerifiedUser(agentA);
    const loginB = await loginUser(agentB, payload.email, payload.password);

    expect(loginB.response.status).toBe(200);

    const sessions = await agentA.get('/api/user/sessions').expect(200);
    expect(sessions.body.data.sessions).toHaveLength(2);
    expect(sessions.body.data.sessions.some((session) => session.current)).toBe(true);

    const otherSession = sessions.body.data.sessions.find((session) => !session.current);

    const revoked = await sendWithCsrf(
      agentA,
      'delete',
      `/api/user/sessions/${otherSession.id}`,
      login.csrfToken,
    );

    expect(revoked.status).toBe(200);
    await agentB.get('/api/auth/me').expect(401);
  });

  it('refuses to revoke the current session through the session endpoint', async () => {
    const agent = createAgent();
    const { login } = await loginVerifiedUser(agent);
    const sessions = await agent.get('/api/user/sessions').expect(200);
    const current = sessions.body.data.sessions.find((session) => session.current);

    const response = await sendWithCsrf(
      agent,
      'delete',
      `/api/user/sessions/${current.id}`,
      login.csrfToken,
    );

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('CURRENT_SESSION');
  });

  it('deletes an account only with the correct password', async () => {
    const agent = createAgent();
    const { payload, login } = await loginVerifiedUser(agent);

    const wrong = await sendWithCsrf(
      agent,
      'delete',
      '/api/user/account',
      login.csrfToken,
      { password: 'WrongPass1' },
    );

    expect(wrong.status).toBe(401);

    const deleted = await sendWithCsrf(
      agent,
      'delete',
      '/api/user/account',
      login.csrfToken,
      { password: payload.password },
    );

    expect(deleted.status).toBe(200);

    const newCsrf = await getCsrfToken(agent);
    const loginAfterDelete = await sendWithCsrf(agent, 'post', '/api/auth/login', newCsrf, {
      email: payload.email,
      password: payload.password,
    });

    expect(loginAfterDelete.status).toBe(401);
  });
});
