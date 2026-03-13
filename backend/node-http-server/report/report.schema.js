const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  reportedUserId: { type: String, required: true },
  reportedUserEmail: { type: String, required: true },
  messageId: String,
  reason: { type: String, required: true },
  description: String,
  status: { type: String, default: 'pending' },
  reviewedBy: String,
  reviewedAt: Date,
  action: String
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
