const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

// Import middleware
const { errorHandler, notFound } = require('../middlewares/errorHandler');
const { logger, securityLogger, performanceLogger } = require('../middlewares/logger');
const { devLimiter } = require('../middlewares/rateLimiter');

// Import routes
const authRouter = require('../routes/auth');
const compilerRouter = require('../routes/compiler');
const problemRouter = require('../routes/problem');
const aiRouter = require('../routes/ai');
const submissionRouter = require('../routes/submission');

const createApp = () => {
  const app = express();

  // Load passport configuration
  require('./passport');

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  // Security and logging middleware
  app.use(securityLogger);
  app.use(performanceLogger);
  app.use(logger);

  // CORS configuration
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Session configuration
  app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your-secret-key', 
    resave: false, 
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Apply development-friendly rate limiting to all routes
  app.use(devLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/compiler', compilerRouter);
  app.use('/api/problem', problemRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/submission', submissionRouter);

  // 404 handler
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = createApp; 