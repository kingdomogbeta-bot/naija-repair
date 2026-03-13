const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, getPaymentByBooking, getAllPayments } = require('./payment.controller');
const { protect } = require('../middleware/auth');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', verifyPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);
router.get('/all', protect, getAllPayments);

module.exports = router;
