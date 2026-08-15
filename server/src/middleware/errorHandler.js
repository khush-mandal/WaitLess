const env = require('../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.message?.startsWith('CORS blocked') ? 403 : 500);
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal Server Error';

  if (env.nodeEnv === 'development') {
    console.error(err);
  }

  const response = {
    success: false,
    error: {
      code,
      message: env.nodeEnv === 'production' ? 'Something went wrong. Please try again later.' : message,
    },
  };

  if (env.nodeEnv === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
