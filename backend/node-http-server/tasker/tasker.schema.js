const mongoose = require('mongoose');
const SCHEMA = mongoose.Schema;

const taskerSchema = new SCHEMA({
  name: {
    type: String,
    required: true,
    trim: true,
    min: [3, 'name should not be less than three characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    min: 8,
    trim: true
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  services: [{
    type: String,
    required: true
  }],
  hourlyRate: {
    type: Number,
    default: 3000
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: 'Lagos'
  },
  state: {
    type: String,
    required: true,
    default: 'Lagos'
  },
  lga: {
    type: String,
    required: true,
    default: 'Ikeja'
  },
  serviceStates: [{
    type: String
  }],
  serviceLGAs: [{
    type: String
  }],
  address: {
    type: String
  },
  landmark: {
    type: String
  },
  photoUrl: {
    type: String,
    default: ''
  },
  nin: {
    type: String,
    default: ''
  },
  ninPhotoUrl: {
    type: String,
    default: ''
  },
  passportPhotoUrl: {
    type: String,
    default: ''
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  verificationRejectionReason: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  suspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: {
    type: Date
  },
  suspensionReason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Tasker', taskerSchema);