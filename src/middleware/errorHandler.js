const config = require('../config');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Error handler middleware
 * Handles different types of errors and sends appropriate responses
 */
function errorHandler(err, req, res, next) {
  // Log error in development
  if (config.env === 'development') {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } else {
    // Log only essential info in production
    console.error('Error occurred:', {
      message: err.message,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: err.details || []
    });
  }

  // Handle type validation errors
  if (err.message.includes('Unsupported')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.TYPE_VALIDATION_ERROR,
      message: err.message
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Invalid JSON',
      message: 'Request body must be valid JSON'
    });
  }

  // Handle payload too large errors
  if (err.status === 413) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request payload exceeds maximum allowed size'
    });
  }

  // Handle rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests. Please try again later.'
    });
  }

  // Default internal server error
  const statusCode = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = config.env === 'production' 
    ? ERROR_MESSAGES.INTERNAL_ERROR 
    : err.message;

  res.status(statusCode).json({
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    message,
    ...(config.env === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: ERROR_MESSAGES.ENDPOINT_NOT_FOUND,
    message: `Cannot ${req.method} ${req.path}`,
    available_endpoints: [
      'GET /health',
      'POST /api/v1/template',
      'GET /api/v1/languages',
      'GET /api/v1/types/:language'
    ]
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};