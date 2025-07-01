const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const bcrypt = require('bcryptjs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage (memory)
const upload = multer({ storage: multer.memoryStorage() });
exports.uploadMiddleware = upload.single('image');

// Get user profile by username (public info)
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Only return public fields
    const { name, username: userUsername, bio, profilePhotoUrl, github, linkedin, twitter, website, email, createdAt } = user;
    res.json({ name, username: userUsername, bio, profilePhotoUrl, github, linkedin, twitter, website, email, createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (only self)
exports.updateUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!req.user || req.user.username !== username) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updateFields = ['bio', 'profilePhotoUrl', 'github', 'linkedin', 'twitter', 'website', 'theme'];
    const updates = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findOneAndUpdate({ username }, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload user profile photo to Cloudinary
exports.uploadUserPhoto = async (req, res) => {
  try {
    const { username } = req.params;
    if (!req.user || req.user.username !== username) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Upload to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `users/${username}`,
            resource_type: 'image',
            public_id: 'profile',
            overwrite: true,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    // Update user profilePhotoUrl
    const user = await User.findOneAndUpdate(
      { username },
      { profilePhotoUrl: result.secure_url },
      { new: true }
    );
    res.json({ message: 'Profile photo updated', url: result.secure_url, user });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
};

// Change user password (only self)
exports.changePassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!req.user || req.user.username !== username) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.password) return res.status(400).json({ message: 'Password change not supported for this account.' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 