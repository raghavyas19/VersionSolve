const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  contact: { type: String, required: true, unique: true }, // For email or phone number
  password: { type: String },
  googleId: { type: String },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);