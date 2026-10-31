import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken = null;
let csrfPromise = null;

export const clearCsrfToken = () => {
  csrfToken = null;
  csrfPromise = null;
};

export const ensureCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  if (!csrfPromise) {
    csrfPromise = api
      .get('/auth/csrf')
      .then((response) => {
        csrfToken = response.data.data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();

  if (csrfToken && !['get', 'head', 'options'].includes(method)) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const code = error.response?.data?.code;

    if (
      code === 'INVALID_CSRF_TOKEN' &&
      originalRequest &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      clearCsrfToken();

      try {
        const token = await ensureCsrfToken();
        originalRequest.headers['X-CSRF-Token'] = token;
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('authify:unauthorized'));
    }

    return Promise.reject(error);
  },
);
