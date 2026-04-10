const rateLimit = require("express-rate-limit");

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10000, // Effectively disabled to prevent localhost lockouts
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Not Found ────────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production";
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    status = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  console.error(`[${new Date().toISOString()}] ${status} — ${message}`);
  if (isDev && err.stack) console.error(err.stack);

  return res.status(status).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { globalLimiter, writeLimiter, notFound, errorHandler };
