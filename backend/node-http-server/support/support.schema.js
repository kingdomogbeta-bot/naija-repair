const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
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
  userRole: {
    type: String,
    enum: ['user', 'tasker'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'payment', 'booking', 'technical', 'account', 'other'],
    default: 'general'
  },
  messages: [{
    senderId: {
      type: String,
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ['user', 'tasker', 'admin', 'support'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  assignedTo: {
    type: String,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  }
}, {
  timestamps: true
});

supportMessageSchema.index({ userId: 1, status: 1 });
supportMessageSchema.index({ ticketId: 1 });
supportMessageSchema.index({ status: 1, priority: 1 });
supportMessageSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);