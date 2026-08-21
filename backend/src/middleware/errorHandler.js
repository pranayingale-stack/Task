// middleware/errorHandler.js
// Central place for turning thrown/passed errors into consistent JSON
// responses, so every route doesn't have to format errors by hand.

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const payload = { error: err.message || 'Internal server error.' };
  if (err.details) payload.details = err.details;

  if (statusCode >= 500) {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json(payload);
}

module.exports = { ApiError, notFoundHandler, errorHandler };
