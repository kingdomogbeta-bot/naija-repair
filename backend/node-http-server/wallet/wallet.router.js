const express = require('express');
const router = express.Router();
const { creditWallet, getWallet, getTransactions, requestWithdrawal, getWithdrawals, processWithdrawal, getAllWithdrawals, getAdminEarnings } = require('./wallet.controller');
const { protect, admin } = require('../middleware/auth');

router.post('/credit', creditWallet);
router.get('/admin/earnings', protect, admin, getAdminEarnings);
router.get('/admin/withdrawals', protect, admin, getAllWithdrawals);
router.put('/withdrawals/:withdrawalId', protect, processWithdrawal);
router.get('/:taskerEmail', protect, getWallet);
router.get('/:taskerEmail/transactions', protect, getTransactions);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/:taskerEmail/withdrawals', protect, getWithdrawals);

module.exports = router;
