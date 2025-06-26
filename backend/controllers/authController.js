const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { asyncHandler } = require('../middlewares/errorHandler');

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

exports.register = asyncHandler(async (req, res) => {
  const { name, username, contact, password, confirmPassword } = req.body;
  
  if (!name || !username || !contact || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ $or: [{ contact }, { username }] });
  if (existingUser) {
    return res.status(400).json({ error: 'Username or contact already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, username, contact, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.status(201).json({ message: 'User registered successfully', token });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  // Try to find user by email (contact) first, then by username
  let user = await User.findOne({ contact: username });
  if (!user) {
    user = await User.findOne({ username: username });
  }
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email/username or password' });
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
      email: user.contact,
      name: user.name
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
      email: req.user.contact,
      name: req.user.name,
      role: req.user.role,
      isActive: req.user.isActive,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    }
  });
});