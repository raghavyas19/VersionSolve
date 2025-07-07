const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const redisClient = require('../config/redis');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Admin Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.status === 'verified') {
        return res.status(400).json({ error: 'Admin already exists.' });
      } else {
        return res.status(400).json({ error: 'Account exists but not verified.', unverified: true, email: existingAdmin.email });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      status: 'pending',
    });
    await admin.save();
    res.status(201).json({ message: 'Admin signup request submitted. Await verification.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    if (admin.status !== 'verified') {
      if (admin.status === 'pending') {
        return res.status(403).json({ error: 'Your email is not verified.', adminUnverified: true, email: admin.email });
      } else {
        return res.status(403).json({ error: `Admin status: ${admin.status}.` });
      }
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    // Issue JWT for admin
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const payload = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ 
      message: 'Admin login successful', 
      admin: { id: admin._id, name: admin.name, email: admin.email, status: admin.status, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// Admin Verify (for session/token validation)
exports.verify = async (req, res) => {
  try {
    // req.user is set by authenticateJWT middleware
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Not authenticated as admin.' });
    }
    res.json({ admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      status: req.user.status,
      role: req.user.role
    }});
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// Admin Logout (clear JWT cookie)
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
  const { email, forPasswordReset } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  if (!forPasswordReset && admin.status === 'verified') return res.status(400).json({ error: 'Email already verified' });

  const otp = generateOTP();
  await redisClient.set(`admin_otp:${email}`, otp, { EX: 300 }); // 5 min expiry

  await sendEmail({
    to: email,
    subject: forPasswordReset ? 'Your Admin OTP for password reset' : 'Your Admin OTP for account verification',
    otp
  });

  res.json({ message: 'OTP sent to admin email' });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, forPasswordReset } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  if (!forPasswordReset && admin.status === 'verified') return res.status(400).json({ error: 'Email already verified' });

  const storedOtp = await redisClient.get(`admin_otp:${email}`);
  if (!storedOtp) return res.status(400).json({ error: 'OTP expired or not found' });
  if (storedOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  if (forPasswordReset) {
    await redisClient.del(`admin_otp:${email}`);
    return res.json({ message: 'OTP verified for password reset' });
  }

  admin.status = 'verified';
  await admin.save();
  await redisClient.del(`admin_otp:${email}`);

  const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
  res.json({ message: 'Admin email verified', token });
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  admin.password = hashedPassword;
  await admin.save();
  res.json({ message: 'Password reset successful.' });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await require('../models/User').find({}, '-password'); // Exclude password
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// Get a user by username (admin only)
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await require('../models/User').findOne({ username }, '-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}; 