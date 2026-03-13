const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true
  },
  taskerId: {
    type: String,
    required: true
  },
  taskerEmail: {
    type: String,
    required: true
  },
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ taskerId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
