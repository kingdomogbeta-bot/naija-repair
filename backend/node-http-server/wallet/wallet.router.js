const express = require('express');
const router = express.Router();
const { creditWallet, getWallet, getTransactions, requestWithdrawal, getWithdrawals, processWithdrawal, getAllWithdrawals } = require('./wallet.controller');
const { protect } = require('../middleware/auth');

router.post('/credit', creditWallet);
router.get('/:taskerEmail', protect, getWallet);
router.get('/:taskerEmail/transactions', protect, getTransactions);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/:taskerEmail/withdrawals', protect, getWithdrawals);
router.put('/withdrawals/:withdrawalId', protect, processWithdrawal);
router.get('/admin/withdrawals', protect, getAllWithdrawals);

module.exports = router;
