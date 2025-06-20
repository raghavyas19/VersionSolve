const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Add this line

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

exports.register = async (req, res) => {
  try {
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
  } catch (error) {
    // console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ contact: username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    // console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login. Please try again.' });
  }
};

exports.googleLogin = (req, res, next) => {
  // console.log('Initiating Google login...'); // Debug log
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  // console.log('Google callback triggered...', req.query); // Debug log
  passport.authenticate('google', {
    failureRedirect: '/api/auth/failure',
    session: false // Disable session since we're using JWT
  })(req, res, (err) => {
    if (err) {
      // console.error('Google auth error:', err);
      return res.status(400).json({ error: err.message });
    }
    const token = jwt.sign({ id: req.user._id, username: req.user.username }, secretKey, { expiresIn: '1h' });
    // Redirect to frontend dashboard with token as query param
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  });
};

exports.verify = async (req, res) => {
  try {
    // console.log('Verify request headers:', req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      // console.log('No token found in headers');
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
      // console.log('Decoded JWT:', decoded);
    } catch (err) {
      // console.error('JWT verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await User.findById(decoded.id).select('-password');
    // console.log('User found for decoded id:', user);
    if (!user) {
      // console.log('User not found for token:', decoded.id);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // console.log('Verification successful for user:', user.username);
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.contact, // Map contact to email
        name: user.name,
        // Add any other fields you want to expose
      }
    });
  } catch (error) {
    // console.error('Verify error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};