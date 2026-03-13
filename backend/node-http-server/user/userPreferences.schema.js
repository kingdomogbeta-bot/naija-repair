const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false }
  },
  billing: {
    cardNumber: String,
    expiry: String
  },
  business: {
    businessName: String,
    taxId: String
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
