const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { asyncHandler } = require('../middlewares/errorHandler');
const redisClient = require('../config/redis');
const sendEmail = require('../utils/sendEmail');

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = asyncHandler(async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;
  
  if (!name || !username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.isEmailVerified) {
      return res.status(400).json({ error: 'User already exists.' });
    } else {
      return res.status(400).json({ error: 'Account exists but not verified.', unverified: true, email: existingUser.email });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, username, email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.status(201).json({ message: 'User registered successfully', token });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  // Try to find user by email first, then by username
  let user = await User.findOne({ email: username });
  if (!user) {
    user = await User.findOne({ username: username });
  }
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email/username or password' });
  }

  // Check for suspension
  if (user.isSuspended) {
    return res.status(403).json({ error: user.suspendReason || 'Your account is suspended and set for deletion.' });
  }

  // Check for temporary ban
  if (user.banExpires && user.banExpires > new Date()) {
    const ms = user.banExpires - new Date();
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return res.status(403).json({ error: `You are temporarily banned. Time remaining: ${min}m ${sec}s`, banExpires: user.banExpires, banReason: user.suspendReason || user.banReason || '' });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({ error: 'Your email is not verified.', unverified: true, email: user.email });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.status(200).json({ 
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      isEmailVerified: user.isEmailVerified,
      profilePhotoUrl: user.profilePhotoUrl
    }
  });
});

exports.googleLogin = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: '/api/auth/failure',
    session: false
  })(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // Update last login
    req.user.lastLogin = new Date();
    req.user.save();
    
    const token = jwt.sign({ id: req.user._id, username: req.user.username }, secretKey, { expiresIn: '1h' });
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  });
};

exports.verify = asyncHandler(async (req, res) => {
  // User is already authenticated by middleware, just return user info
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      isActive: req.user.isActive,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
      isEmailVerified: req.user.isEmailVerified,
      profilePhotoUrl: req.user.profilePhotoUrl
    }
  });
});

exports.sendOtp = asyncHandler(async (req, res) => {
  const { email, forPasswordReset } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!forPasswordReset && user.isEmailVerified) {
    return res.status(400).json({ error: 'Email already verified' });
  }

  const otp = generateOTP();
  await redisClient.set(`otp:${email}`, otp, { EX: 300 }); // 5 min expiry

  await sendEmail({
    to: email,
    subject: forPasswordReset ? 'Your OTP for password reset' : 'Your OTP for account verification',
    otp
  });

  res.json({ message: 'OTP sent to email' });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, forPasswordReset } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!forPasswordReset && user.isEmailVerified) return res.status(400).json({ error: 'Email already verified' });

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp) return res.status(400).json({ error: 'OTP expired or not found' });
  if (storedOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  if (forPasswordReset) {
    await redisClient.del(`otp:${email}`);
    return res.json({ message: 'OTP verified for password reset' });
  }

  user.isEmailVerified = true;
  await user.save();
  await redisClient.del(`otp:${email}`);

  const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'Email verified', token });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();
  res.json({ message: 'Password reset successful.' });
});