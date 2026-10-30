import { useCallback, useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { getApiError } from '../utils/apiError';

const fetchSessions = async () => {
  const data = await userService.getSessions();
  return data.sessions || [];
};

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    fetchSessions()
      .then((nextSessions) => {
        if (active) {
          setSessions(nextSessions);
          setIsLoading(false);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(getApiError(requestError).message);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSessions = await fetchSessions();
      setSessions(nextSessions);
      return nextSessions;
    } catch (requestError) {
      setError(getApiError(requestError).message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId) => {
    await userService.revokeSession(sessionId);
    setSessions((current) => current.filter((session) => session.id !== sessionId));
  }, []);

  return {
    sessions,
    isLoading,
    error,
    refresh,
    revokeSession,
  };
};
