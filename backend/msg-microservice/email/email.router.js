const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('./email.controller');

console.log('📡 EMAIL ROUTER LOADED');

router.post('/send-otp', (req, res, next) => {
  console.log('🎯 ROUTER: /send-otp endpoint hit!');
  console.log('🎯 Request body:', req.body);
  sendOTP(req, res, next);
});

router.post('/verify-otp', (req, res, next) => {
  console.log('🎯 ROUTER: /verify-otp endpoint hit!');
  verifyOTP(req, res, next);
});

module.exports = router;

