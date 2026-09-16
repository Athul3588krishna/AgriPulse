const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  language: { type: String, enum: ['en', 'ml'], default: 'en' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  subscriptionTier: { type: String, enum: ['free', 'pro', 'fpo'], default: 'free' },
  subscriptionExpiresAt: { type: Date, default: null },
  monthlyScanCount: { type: Number, default: 0 },
  lastScanResetDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
