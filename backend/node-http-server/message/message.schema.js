const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  receiverEmail: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ read: 1 });

module.exports = mongoose.model('Message', messageSchema);
