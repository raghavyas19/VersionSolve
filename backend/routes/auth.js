const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middlewares/validation');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/verify', authenticateJWT, authController.verify);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;