import { useCallback, useEffect, useState } from 'react';

export const useCountdown = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(Math.max(0, Math.ceil(initialSeconds)));

  useEffect(() => {
    if (seconds <= 0) return undefined;

    const timeout = setTimeout(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [seconds]);

  const start = useCallback((value) => {
    setSeconds(Math.max(0, Math.ceil(Number(value) || 0)));
  }, []);

  const reset = useCallback(() => setSeconds(0), []);

  return {
    seconds,
    isActive: seconds > 0,
    start,
    reset,
  };
};
