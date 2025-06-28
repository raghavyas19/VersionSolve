const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  try {
    let token = req.headers['authorization']?.split(' ')[1];
    if (!token && req.cookies) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // Try admin
      user = await Admin.findById(decoded.id).select('-password');
    }
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token - user/admin not found' 
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

// Optional Authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // For now, we'll use a simple role system
    // You can extend this by adding a role field to the User model
    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Admin access middleware
const requireAdmin = requireRole(['admin', 'superadmin']);

// Super admin access middleware
const requireSuperAdmin = requireRole(['superadmin']);

module.exports = {
  authenticateJWT,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSuperAdmin
}; 