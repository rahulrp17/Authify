import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { clearCsrfToken, ensureCsrfToken } from '../services/api';
import { getApiError } from '../utils/apiError';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data.user);
      return data.user;
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError.status !== 401) {
        toast.error(apiError.message);
      }

      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await ensureCsrfToken();
      } catch {
        // CSRF will be retried by the request interceptor when needed.
      }

      try {
        const data = await authService.me();

        if (active) {
          setUser(data.user);
        }
      } catch (error) {
        if (active) {
          setUser(null);

          if (error.response?.status && error.response.status !== 401) {
            toast.error(getApiError(error).message);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('authify:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('authify:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => authService.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      clearCsrfToken();
    }
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
      setUser,
    }),
    [user, isLoading, login, register, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
