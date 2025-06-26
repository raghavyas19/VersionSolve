// Authentication middleware
const { 
  authenticateJWT, 
  optionalAuth, 
  requireRole, 
  requireAdmin, 
  requireSuperAdmin 
} = require('./auth');

// Validation middleware
const {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProblemCreation,
  validateCodeExecution,
  validateSubmission,
  validateId,
  validatePagination
} = require('./validation');

// Error handling middleware
const {
  asyncHandler,
  errorHandler,
  notFound
} = require('./errorHandler');

// Rate limiting middleware
const {
  apiLimiter,
  authLimiter,
  codeExecutionLimiter,
  aiLimiter,
  adminLimiter
} = require('./rateLimiter');

// Logging middleware
const {
  logger,
  logRequest,
  securityLogger,
  performanceLogger
} = require('./logger');

module.exports = {
  // Authentication
  authenticateJWT,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  
  // Validation
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProblemCreation,
  validateCodeExecution,
  validateSubmission,
  validateId,
  validatePagination,
  
  // Error handling
  asyncHandler,
  errorHandler,
  notFound,
  
  // Rate limiting
  apiLimiter,
  authLimiter,
  codeExecutionLimiter,
  aiLimiter,
  adminLimiter,
  
  // Logging
  logger,
  logRequest,
  securityLogger,
  performanceLogger
}; 