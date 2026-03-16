const Report = require('./report.schema');
const { Wallet, Transaction, UserWallet, UserTransaction } = require('../wallet/wallet.schema');
const Notification = require('../notification/notification.schema');
const User = require('../user/user.schema');

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({
      ...req.body,
      reporterId: req.user.id,
      reporterEmail: req.user.email,
      reporterName: req.user.name,
    });
    if (global.io) global.io.emit('report_created', report);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (global.io) global.io.emit('report_updated', report);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.refundStatus === 'issued') return res.status(400).json({ message: 'Refund already issued' });

    const refundAmount = report.refundAmount || req.body.refundAmount || 0;
    if (!refundAmount || refundAmount <= 0) return res.status(400).json({ message: 'Invalid refund amount' });

    // 1. Debit tasker wallet (allow negative — tasker owes even if already withdrawn)
    if (report.taskerEmail) {
      let taskerWallet = await Wallet.findOne({ taskerEmail: report.taskerEmail });
      if (!taskerWallet) {
        taskerWallet = new Wallet({ taskerEmail: report.taskerEmail, balance: 0, totalEarnings: 0 });
      }
      const taskerBalanceBefore = taskerWallet.balance;
      taskerWallet.balance -= refundAmount;
      await taskerWallet.save();

      await Transaction.create({
        taskerEmail: report.taskerEmail,
        type: 'debit',
        amount: refundAmount,
        description: `Refund deducted — Report #${report._id} (${report.reason})`,
        bookingId: report.bookingId,
        balanceBefore: taskerBalanceBefore,
        balanceAfter: taskerWallet.balance
      });
    }

    // 2. Credit user wallet
    let userWallet = await UserWallet.findOne({ userEmail: report.reporterEmail });
    if (!userWallet) {
      userWallet = new UserWallet({ userEmail: report.reporterEmail, balance: 0, totalRefunds: 0 });
    }
    const userBalanceBefore = userWallet.balance;
    userWallet.balance += refundAmount;
    userWallet.totalRefunds += refundAmount;
    await userWallet.save();

    await UserTransaction.create({
      userEmail: report.reporterEmail,
      type: 'refund',
      amount: refundAmount,
      description: `Refund for ${report.service || 'booking'} — ${report.reason}`,
      bookingId: report.bookingId,
      reportId: report._id.toString(),
      balanceBefore: userBalanceBefore,
      balanceAfter: userWallet.balance
    });

    // 3. Send notification to user
    const user = await User.findOne({ email: report.reporterEmail });
    if (user) {
      await Notification.create({
        userId: user._id.toString(),
        userEmail: report.reporterEmail,
        type: 'payment',
        title: '💰 Refund Issued to Your Wallet',
        message: `Your report has been reviewed and ₦${refundAmount.toLocaleString()} has been refunded to your wallet. Check your wallet to see your balance.`,
        bookingId: report.bookingId
      });
      if (global.io) {
        global.io.to(user._id.toString()).emit('notification', {
          title: '💰 Refund Issued',
          message: `₦${refundAmount.toLocaleString()} has been added to your wallet.`
        });
      }
    }

    // 4. Update report status
    report.refundStatus = 'issued';
    report.refundAmount = refundAmount;
    report.status = 'refunded';
    report.reviewedBy = req.user.email;
    report.reviewedAt = new Date();
    await report.save();

    res.json({ success: true, data: report, refundAmount });
  } catch (error) {
    console.error('Process refund error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Report.countDocuments({ adminRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Report.updateMany({ adminRead: false }, { adminRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserWallet = async (req, res) => {
  try {
    const { userEmail } = req.params;
    let wallet = await UserWallet.findOne({ userEmail });
    if (!wallet) wallet = new UserWallet({ userEmail, balance: 0, totalRefunds: 0 });
    const transactions = await UserTransaction.find({ userEmail }).sort({ createdAt: -1 });
    res.json({ success: true, data: wallet, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
