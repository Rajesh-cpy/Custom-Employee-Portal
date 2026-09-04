function errorHandler(err, req, res, next) {
  console.error('[Internal Server Error]:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 
      ? 'Something went wrong. Please try again later.' 
      : (err.message || 'An error occurred processing your request.')
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
