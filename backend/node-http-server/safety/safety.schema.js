const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  taskerId: String,
  taskerName: String,
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'pending' },
  priority: { type: String, default: 'medium' },
  resolvedBy: String,
  resolvedAt: Date,
  notes: String
}, { timestamps: true });

const trackingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  taskerId: String,
  status: { type: String, default: 'active' },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  location: String,
  emergencyContact: String
}, { timestamps: true });

const SafetyReport = mongoose.model('SafetyReport', safetyReportSchema);
const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = { SafetyReport, Tracking };
