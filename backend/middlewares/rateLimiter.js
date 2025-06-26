const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for authentication endpoints (more lenient for development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // More lenient in development
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and OPTIONS requests
    return req.method === 'OPTIONS' || req.path === '/health';
  }
});

// Rate limiter for code execution (more strict)
const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // More lenient in development
  message: {
    success: false,
    error: 'Too many code execution requests, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI endpoints (very strict due to cost)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 3 : 10, // More lenient in development
  message: {
    success: false,
    error: 'Too many AI requests, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for problem creation (admin only)
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // More lenient in development
  message: {
    success: false,
    error: 'Too many admin actions, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Development-friendly rate limiter (disabled in development)
const devLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 1000, // Very high limit in development
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and OPTIONS requests
    return req.method === 'OPTIONS' || req.path === '/health';
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  codeExecutionLimiter,
  aiLimiter,
  adminLimiter,
  devLimiter
}; 