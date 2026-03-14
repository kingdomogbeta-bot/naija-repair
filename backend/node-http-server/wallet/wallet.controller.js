const { Wallet, Transaction, Withdrawal, AdminEarnings } = require('./wallet.schema');
const Settings = require('../settings/settings.schema');

exports.creditWallet = async (req, res) => {
  try {
    const { taskerEmail, amount, bookingId, paymentReference, description } = req.body;

    if (!taskerEmail || !amount) {
      return res.status(400).json({ error: 'Tasker email and amount are required' });
    }

    // Read commission rate from settings (default 15%)
    const commissionSetting = await Settings.findOne({ key: 'commissionRate' });
    const commissionRate = commissionSetting ? (commissionSetting.value / 100) : 0.15;

    const commission = Math.round(amount * commissionRate);
    const taskerAmount = amount - commission;

    let wallet = await Wallet.findOne({ taskerEmail });
    if (!wallet) {
      wallet = new Wallet({ taskerEmail, balance: 0, totalEarnings: 0 });
    }

    const balanceBefore = wallet.balance;
    wallet.balance += taskerAmount;
    wallet.totalEarnings += taskerAmount;
    await wallet.save();

    await Transaction.create({
      taskerEmail,
      type: 'credit',
      amount: taskerAmount,
      description: description || `Payment for booking ${bookingId}`,
      bookingId,
      paymentReference,
      balanceBefore,
      balanceAfter: wallet.balance
    });

    // Track admin commission earnings
    let adminEarnings = await AdminEarnings.findOne({ key: 'platform' });
    if (!adminEarnings) {
      adminEarnings = new AdminEarnings({ key: 'platform', totalCommission: 0, totalTransactions: 0 });
    }
    adminEarnings.totalCommission += commission;
    adminEarnings.totalTransactions += 1;
    adminEarnings.lastUpdated = new Date();
    await adminEarnings.save();

    res.json({ success: true, wallet, commission, taskerAmount, commissionRate: commissionRate * 100 });
  } catch (error) {
    console.error('Credit wallet error:', error.message);
    res.status(500).json({ error: 'Failed to credit wallet' });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const { taskerEmail } = req.params;
    
    let wallet = await Wallet.findOne({ taskerEmail });
    
    if (!wallet) {
      wallet = new Wallet({ taskerEmail, balance: 0, totalEarnings: 0 });
      await wallet.save();
    }

    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Get wallet error:', error.message);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { taskerEmail } = req.params;
    const transactions = await Transaction.find({ taskerEmail }).sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { taskerEmail, amount, bankName, accountNumber, accountName } = req.body;

    if (!taskerEmail || !amount || !bankName || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const wallet = await Wallet.findOne({ taskerEmail });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const withdrawal = new Withdrawal({
      taskerEmail,
      amount,
      bankName,
      accountNumber,
      accountName,
      reference: `WD-${Date.now()}`
    });
    await withdrawal.save();

    res.json({ success: true, data: withdrawal });
  } catch (error) {
    console.error('Request withdrawal error:', error.message);
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const { taskerEmail } = req.params;
    const withdrawals = await Withdrawal.find({ taskerEmail }).sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error.message);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, processedBy } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (status === 'completed') {
      const wallet = await Wallet.findOne({ taskerEmail: withdrawal.taskerEmail });
      
      if (!wallet || wallet.balance < withdrawal.amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const balanceBefore = wallet.balance;
      wallet.balance -= withdrawal.amount;
      wallet.totalWithdrawals += withdrawal.amount;
      await wallet.save();

      const transaction = new Transaction({
        taskerEmail: withdrawal.taskerEmail,
        type: 'debit',
        amount: withdrawal.amount,
        description: `Withdrawal to ${withdrawal.bankName} - ${withdrawal.accountNumber}`,
        balanceBefore,
        balanceAfter: wallet.balance
      });
      await transaction.save();
    }

    withdrawal.status = status;
    withdrawal.processedBy = processedBy;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({ success: true, data: withdrawal });
  } catch (error) {
    console.error('Process withdrawal error:', error.message);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
};

exports.migrateHistoricPayments = async (req, res) => {
  try {
    const Payment = require('../payment/payment.schema');
    const Tasker = require('../tasker/tasker.schema');

    const commissionSetting = await Settings.findOne({ key: 'commissionRate' });
    const commissionRate = commissionSetting ? (commissionSetting.value / 100) : 0.15;

    // Only process successful payments that have no existing transaction record
    const payments = await Payment.find({ status: 'success' });

    let processed = 0;
    let skipped = 0;

    for (const payment of payments) {
      // Skip if already processed (transaction exists for this reference)
      const existing = await Transaction.findOne({ paymentReference: payment.reference });
      if (existing) { skipped++; continue; }

      // Look up tasker email
      const tasker = await Tasker.findById(payment.taskerId).select('email');
      if (!tasker) { skipped++; continue; }

      const commission = Math.round(payment.amount * commissionRate);
      const taskerAmount = payment.amount - commission;

      // Credit tasker wallet
      let wallet = await Wallet.findOne({ taskerEmail: tasker.email });
      if (!wallet) wallet = new Wallet({ taskerEmail: tasker.email, balance: 0, totalEarnings: 0 });

      const balanceBefore = wallet.balance;
      wallet.balance += taskerAmount;
      wallet.totalEarnings += taskerAmount;
      await wallet.save();

      await Transaction.create({
        taskerEmail: tasker.email,
        type: 'credit',
        amount: taskerAmount,
        description: `Migrated payment for booking ${payment.bookingId}`,
        bookingId: payment.bookingId,
        paymentReference: payment.reference,
        balanceBefore,
        balanceAfter: wallet.balance
      });

      // Update admin earnings
      let adminEarnings = await AdminEarnings.findOne({ key: 'platform' });
      if (!adminEarnings) adminEarnings = new AdminEarnings({ key: 'platform', totalCommission: 0, totalTransactions: 0 });
      adminEarnings.totalCommission += commission;
      adminEarnings.totalTransactions += 1;
      adminEarnings.lastUpdated = new Date();
      await adminEarnings.save();

      processed++;
    }

    res.json({ success: true, processed, skipped, commissionRate: commissionRate * 100 });
  } catch (error) {
    console.error('Migration error:', error.message);
    res.status(500).json({ error: 'Migration failed', details: error.message });
  }
};

exports.getAdminEarnings = async (req, res) => {
  try {
    const earnings = await AdminEarnings.findOne({ key: 'platform' });
    res.json({ success: true, data: earnings || { totalCommission: 0, totalTransactions: 0 } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin earnings' });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error('Get all withdrawals error:', error.message);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};
