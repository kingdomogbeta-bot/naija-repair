const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  taskerEmail: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 }
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  taskerEmail: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  bookingId: { type: String },
  paymentReference: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number }
}, { timestamps: true });

const withdrawalSchema = new mongoose.Schema({
  taskerEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  processedBy: { type: String },
  processedAt: { type: Date },
  reference: { type: String }
}, { timestamps: true });

module.exports = {
  Wallet: mongoose.model('Wallet', walletSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Withdrawal: mongoose.model('Withdrawal', withdrawalSchema)
};
