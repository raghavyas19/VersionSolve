const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  contact: { type: String, required: true, unique: true }, // For email or phone number
  password: { type: String },
  googleId: { type: String },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin'], 
    default: 'user' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);