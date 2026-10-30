import { api, clearCsrfToken, ensureCsrfToken } from './api';

export const userService = {
  async getProfile() {
    const { data } = await api.get('/user/profile');
    return data.data;
  },

  async updateProfile(payload) {
    await ensureCsrfToken();
    const { data } = await api.put('/user/profile', payload);
    return data.data;
  },

  async changePassword(payload) {
    await ensureCsrfToken();
    const { data } = await api.put('/user/change-password', payload);
    return data;
  },

  async deleteAccount(payload) {
    await ensureCsrfToken();

    try {
      const { data } = await api.delete('/user/account', { data: payload });
      return data;
    } finally {
      clearCsrfToken();
    }
  },

  async getSessions() {
    const { data } = await api.get('/user/sessions');
    return data.data;
  },

  async revokeSession(sessionId) {
    await ensureCsrfToken();
    const { data } = await api.delete(`/user/sessions/${sessionId}`);
    return data;
  },
};
