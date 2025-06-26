const morgan = require('morgan');

// Custom token for request body logging (for debugging)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body);
  }
  return '';
});

// Custom token for response time in a more readable format
morgan.token('response-time-ms', (req, res) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return ms.toFixed(2);
});

// Custom token for user info
morgan.token('user', (req) => {
  return req.user ? req.user.username : 'anonymous';
});

// Development logging format
const devFormat = ':method :url :status :response-time-ms ms - :user - :body';

// Production logging format (less verbose)
const prodFormat = ':method :url :status :response-time-ms ms - :user';

// Create morgan middleware based on environment
const logger = morgan(process.env.NODE_ENV === 'production' ? prodFormat : devFormat, {
  skip: (req, res) => {
    // Skip logging for health checks and static files
    return req.url === '/health' || req.url.startsWith('/static');
  }
});

// Custom logging middleware for important events
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  // Log request start
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Started`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${logLevel}`);
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log potential security issues
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i
  ];
  
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  const body = JSON.stringify(req.body);
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(url) || pattern.test(body)
  );
  
  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious request detected:`, {
      ip: req.ip,
      userAgent,
      url,
      body: body.substring(0, 200), // Limit body logging
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Performance monitoring middleware
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second
      console.warn(`[PERFORMANCE] Slow request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

module.exports = {
  logger,
  logRequest,
  securityLogger,
  performanceLogger
}; 