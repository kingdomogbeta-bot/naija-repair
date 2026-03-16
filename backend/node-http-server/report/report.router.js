const express = require('express');
const router = express.Router();
const { createReport, getAllReports, updateReport, processRefund, getUserWallet } = require('./report.controller');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createReport);
router.get('/', protect, admin, getAllReports);
router.put('/:id', protect, admin, updateReport);
router.post('/:id/refund', protect, admin, processRefund);
router.get('/user-wallet/:userEmail', protect, getUserWallet);

module.exports = router;
