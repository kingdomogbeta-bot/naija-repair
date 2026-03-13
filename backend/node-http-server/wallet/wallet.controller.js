const { Wallet, Transaction, Withdrawal } = require('./wallet.schema');

const COMMISSION_RATE = 0.15;

exports.creditWallet = async (req, res) => {
  try {
    const { taskerEmail, amount, bookingId, paymentReference, description } = req.body;

    if (!taskerEmail || !amount) {
      return res.status(400).json({ error: 'Tasker email and amount are required' });
    }

    const commission = amount * COMMISSION_RATE;
    const taskerAmount = amount - commission;

    let wallet = await Wallet.findOne({ taskerEmail });
    
    if (!wallet) {
      wallet = new Wallet({ taskerEmail, balance: 0, totalEarnings: 0 });
    }

    const balanceBefore = wallet.balance;
    wallet.balance += taskerAmount;
    wallet.totalEarnings += taskerAmount;
    await wallet.save();

    const transaction = new Transaction({
      taskerEmail,
      type: 'credit',
      amount: taskerAmount,
      description: description || `Payment for booking ${bookingId}`,
      bookingId,
      paymentReference,
      balanceBefore,
      balanceAfter: wallet.balance
    });
    await transaction.save();

    res.json({
      success: true,
      wallet,
      transaction,
      commission,
      taskerAmount
    });
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

exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error('Get all withdrawals error:', error.message);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};
