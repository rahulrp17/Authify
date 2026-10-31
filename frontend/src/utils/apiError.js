export const getApiError = (error) => {
  const response = error?.response;
  const data = response?.data;
  const timedOut = error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT';

  return {
    message:
      data?.message ||
      (timedOut
        ? 'The server took too long to respond. Please try again in a moment.'
        : response?.status === 429
          ? 'Too many attempts. Please wait and try again.'
          : 'Something went wrong. Please try again.'),
    code: data?.code || 'REQUEST_FAILED',
    errors: data?.errors || [],
    status: response?.status,
  };
};

export const applyServerErrors = (errors = [], setError) => {
  errors.forEach(({ field, message }) => {
    if (field && message) {
      setError(field, { type: 'server', message });
    }
  });
};

