const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, requireAdmin } = require('../middlewares/auth');

// Admin signup
router.post('/auth/signup', adminController.signup);

// Admin OTP endpoints
router.post('/auth/send-otp', adminController.sendOtp);
router.post('/auth/verify-otp', adminController.verifyOtp);

// Admin login
router.post('/auth/login', adminController.login);

// Protected admin routes (example)
router.get('/dashboard', authenticateJWT, requireAdmin, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard', admin: req.user });
});

// Admin verify endpoint
router.get('/verify', authenticateJWT, requireAdmin, adminController.verify);

// Admin logout endpoint
router.post('/logout', adminController.logout);

// Admin reset password endpoint
router.post('/auth/reset-password', adminController.resetPassword);

module.exports = router; 