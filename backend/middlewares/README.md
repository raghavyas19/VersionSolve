# Middleware Documentation

This directory contains all the middleware functions for the VersionSolve backend API. These middleware functions provide authentication, validation, error handling, rate limiting, and logging capabilities.

## Table of Contents

- [Authentication Middleware](#authentication-middleware)
- [Validation Middleware](#validation-middleware)
- [Error Handling Middleware](#error-handling-middleware)
- [Rate Limiting Middleware](#rate-limiting-middleware)
- [Logging Middleware](#logging-middleware)
- [Usage Examples](#usage-examples)

## Authentication Middleware

### `authenticateJWT`
Verifies JWT tokens and attaches user information to the request object.

```javascript
const { authenticateJWT } = require('../middlewares/auth');

router.get('/protected', authenticateJWT, (req, res) => {
  // req.user is now available
  res.json({ user: req.user });
});
```

### `optionalAuth`
Similar to `authenticateJWT` but doesn't fail if no token is provided.

```javascript
const { optionalAuth } = require('../middlewares/auth');

router.get('/optional', optionalAuth, (req, res) => {
  // req.user may or may not be available
  res.json({ user: req.user || null });
});
```

### `requireRole(roles)`
Checks if the authenticated user has one of the specified roles.

```javascript
const { requireRole } = require('../middlewares/auth');

router.post('/admin-only', authenticateJWT, requireRole(['admin', 'superadmin']), (req, res) => {
  // Only admins and superadmins can access this
});
```

### `requireAdmin`
Shorthand for requiring admin or superadmin role.

```javascript
const { requireAdmin } = require('../middlewares/auth');

router.post('/admin', authenticateJWT, requireAdmin, (req, res) => {
  // Admin only endpoint
});
```

### `requireSuperAdmin`
Shorthand for requiring superadmin role only.

```javascript
const { requireSuperAdmin } = require('../middlewares/auth');

router.post('/superadmin', authenticateJWT, requireSuperAdmin, (req, res) => {
  // Superadmin only endpoint
});
```

## Validation Middleware

### `validateRegistration`
Validates user registration data.

```javascript
const { validateRegistration } = require('../middlewares/validation');

router.post('/register', validateRegistration, authController.register);
```

### `validateLogin`
Validates user login data.

```javascript
const { validateLogin } = require('../middlewares/validation');

router.post('/login', validateLogin, authController.login);
```

### `validateProblemCreation`
Validates problem creation data.

```javascript
const { validateProblemCreation } = require('../middlewares/validation');

router.post('/problems', authenticateJWT, requireAdmin, validateProblemCreation, problemController.create);
```

### `validateCodeExecution`
Validates code execution requests.

```javascript
const { validateCodeExecution } = require('../middlewares/validation');

router.post('/execute', validateCodeExecution, compilerController.execute);
```

### `validateSubmission`
Validates submission data.

```javascript
const { validateSubmission } = require('../middlewares/validation');

router.post('/submissions', authenticateJWT, validateSubmission, submissionController.create);
```

### `validateId`
Validates MongoDB ObjectId parameters.

```javascript
const { validateId } = require('../middlewares/validation');

router.get('/problems/:id', validateId, problemController.getById);
```

### `validatePagination`
Validates pagination query parameters.

```javascript
const { validatePagination } = require('../middlewares/validation');

router.get('/problems', validatePagination, problemController.list);
```

## Error Handling Middleware

### `asyncHandler`
Wraps async controller functions to eliminate try-catch blocks.

```javascript
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();
  res.json(problems);
});
```

### `errorHandler`
Global error handler (must be last in middleware chain).

```javascript
const { errorHandler } = require('../middlewares/errorHandler');

app.use(errorHandler);
```

### `notFound`
Handles 404 errors for undefined routes.

```javascript
const { notFound } = require('../middlewares/errorHandler');

app.use(notFound);
```

## Rate Limiting Middleware

### `apiLimiter`
General API rate limiting (100 requests per 15 minutes).

```javascript
const { apiLimiter } = require('../middlewares/rateLimiter');

app.use(apiLimiter);
```

### `authLimiter`
Stricter rate limiting for authentication (5 attempts per 15 minutes).

```javascript
const { authLimiter } = require('../middlewares/rateLimiter');

router.use(authLimiter);
```

### `codeExecutionLimiter`
Rate limiting for code execution (10 requests per minute).

```javascript
const { codeExecutionLimiter } = require('../middlewares/rateLimiter');

router.post('/execute', codeExecutionLimiter, compilerController.execute);
```

### `aiLimiter`
Very strict rate limiting for AI endpoints (3 requests per 5 minutes).

```javascript
const { aiLimiter } = require('../middlewares/rateLimiter');

router.use(aiLimiter);
```

### `adminLimiter`
Rate limiting for admin actions (20 actions per hour).

```javascript
const { adminLimiter } = require('../middlewares/rateLimiter');

router.post('/admin-action', authenticateJWT, requireAdmin, adminLimiter, adminController.action);
```

## Logging Middleware

### `logger`
HTTP request logging using Morgan.

```javascript
const { logger } = require('../middlewares/logger');

app.use(logger);
```

### `securityLogger`
Logs suspicious requests for security monitoring.

```javascript
const { securityLogger } = require('../middlewares/logger');

app.use(securityLogger);
```

### `performanceLogger`
Monitors and logs slow requests.

```javascript
const { performanceLogger } = require('../middlewares/logger');

app.use(performanceLogger);
```

## Usage Examples

### Complete Route Example

```javascript
const express = require('express');
const router = express.Router();
const { 
  authenticateJWT, 
  requireAdmin, 
  validateProblemCreation, 
  adminLimiter,
  asyncHandler 
} = require('../middlewares');

// Apply rate limiting to all routes in this router
router.use(adminLimiter);

// Protected admin route with validation
router.post('/problems', 
  authenticateJWT,           // Check authentication
  requireAdmin,              // Check admin role
  validateProblemCreation,   // Validate input
  asyncHandler(async (req, res) => {
    // Controller logic here
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  })
);

module.exports = router;
```

### Error Handling Example

```javascript
const { asyncHandler } = require('../middlewares/errorHandler');

// Before (with try-catch)
exports.getProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// After (with asyncHandler)
exports.getProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();
  res.json(problems);
});
```

## Best Practices

1. **Order Matters**: Always apply middleware in the correct order:
   - Security middleware first
   - Authentication middleware
   - Validation middleware
   - Rate limiting middleware
   - Route handlers
   - Error handling middleware last

2. **Use asyncHandler**: Wrap all async controller functions with `asyncHandler` to eliminate try-catch blocks.

3. **Validate Input**: Always validate user input using the validation middleware.

4. **Rate Limiting**: Apply appropriate rate limiting based on the endpoint's sensitivity.

5. **Error Handling**: Let the global error handler manage all errors instead of handling them in controllers.

6. **Logging**: Use the logging middleware to track requests and identify issues.

## Dependencies

Make sure to install the required dependencies:

```bash
npm install express-validator express-rate-limit morgan
```

## Environment Variables

The middleware uses the following environment variables:

- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: Secret for session management 