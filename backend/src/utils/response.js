export const sendSuccess = (res, { status = 200, message = 'Request completed successfully', data } = {}) => {
  const payload = { success: true, message };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(status).json(payload);
};

export const sendCreated = (res, { message = 'Resource created successfully', data } = {}) =>
  sendSuccess(res, { status: 201, message, data });
