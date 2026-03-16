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

const adminEarningsSchema = new mongoose.Schema({
  key: { type: String, default: 'platform', unique: true },
  totalCommission: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
  Wallet: mongoose.model('Wallet', walletSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Withdrawal: mongoose.model('Withdrawal', withdrawalSchema),
  AdminEarnings: mongoose.model('AdminEarnings', adminEarningsSchema)
};

const userWalletSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  totalRefunds: { type: Number, default: 0 }
}, { timestamps: true });

const userTransactionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  type: { type: String, enum: ['refund'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  bookingId: { type: String },
  reportId: { type: String },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number }
}, { timestamps: true });

module.exports.UserWallet = mongoose.model('UserWallet', userWalletSchema);
module.exports.UserTransaction = mongoose.model('UserTransaction', userTransactionSchema);
