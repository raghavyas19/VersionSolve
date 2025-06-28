const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Admin Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists.' });
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
      return res.status(403).json({ error: `Admin status: ${admin.status}.` });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    // Issue JWT for admin
    const jwt = require('jsonwebtoken');
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