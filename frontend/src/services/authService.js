import { api, clearCsrfToken, ensureCsrfToken } from './api';

export const authService = {
  async getCsrf() {
    return ensureCsrfToken();
  },

  async register(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },

  async verifyEmail(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/verify-email', payload);
    return data.data;
  },

  async resendOtp(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/resend-otp', payload);
    return data.data;
  },

  async login(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  },

  async logout() {
    await ensureCsrfToken();

    try {
      const { data } = await api.post('/auth/logout');
      return data;
    } finally {
      clearCsrfToken();
    }
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  async forgotPassword(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/forgot-password', payload);
    return data.data;
  },

  async verifyResetOtp(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/verify-reset-otp', payload);
    return data.data;
  },

  async resetPassword(payload) {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },
};
