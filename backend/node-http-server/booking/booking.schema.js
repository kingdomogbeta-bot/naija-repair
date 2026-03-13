const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  taskerId: {
    type: String
  },
  taskerEmail: {
    type: String
  },
  taskerName: {
    type: String
  },
  taskerPhoto: {
    type: String
  },
  service: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  state: {
    type: String
  },
  lga: {
    type: String
  },
  address: {
    type: String
  },
  landmark: {
    type: String
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  estimatedHours: {
    type: Number,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed', 'cancelled', 'declined', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded', 'held'],
    default: 'unpaid'
  },
  noShowReported: {
    type: Boolean,
    default: false
  },
  noShowReportedAt: {
    type: Date
  },
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundRequestedAt: {
    type: Date
  },
  refundReason: {
    type: String
  },
  arrivalConfirmed: {
    type: Boolean,
    default: false
  },
  arrivalConfirmedAt: {
    type: Date
  },
  assignedTo: {
    type: String
  },
  assignedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String
  }
}, {
  timestamps: true
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ taskerId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
