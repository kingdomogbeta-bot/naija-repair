const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  reporterName: { type: String },
  reportedUserId: { type: String },
  reportedUserEmail: { type: String },
  bookingId: { type: String },
  taskerEmail: { type: String },
  taskerName: { type: String },
  service: { type: String },
  refundAmount: { type: Number, default: 0 },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'reviewed', 'refunded', 'dismissed'], default: 'pending' },
  refundStatus: { type: String, enum: ['none', 'issued', 'failed'], default: 'none' },
  reviewedBy: String,
  reviewedAt: Date,
  action: String
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
