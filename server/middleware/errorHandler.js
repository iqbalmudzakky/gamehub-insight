/**
 * Centralized Error Handling Middleware
 * Menangani semua error yang terjadi di aplikasi
 */

const errorHandler = (err, req, res, next) => {
  // Set default error values
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan pada server";
  const errorDetails = process.env.NODE_ENV === "development" ? err : {};

  // Log error (bisa di-extend dengan logging service)
  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    stack: err.stack,
  });

  // Send error response
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: errorDetails }),
  });
};

/**
 * Async Error Wrapper untuk menghandle errors di async functions
 * Gunakan: router.get('/endpoint', asyncHandler(controllerFunction))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
