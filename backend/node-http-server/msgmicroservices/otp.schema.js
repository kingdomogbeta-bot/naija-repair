const mongoose = require('mongoose');
const SCHEMA = mongoose.Schema;

const otpSchema = new SCHEMA({
  email: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema, 'otps');
