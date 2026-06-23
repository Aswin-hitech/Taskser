const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("[SERVER ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
