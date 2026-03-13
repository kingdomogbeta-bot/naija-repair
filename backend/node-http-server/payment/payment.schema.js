const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  taskerId: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paystackResponse: { type: Object },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
