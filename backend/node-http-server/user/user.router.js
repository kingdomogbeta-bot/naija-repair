const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode, register, login, getProfile, updateProfile, deleteAccount, getAllUsers, uploadPhoto, deletePhoto, changePassword, getPreferences, updatePreferences } = require('./user.controller');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Logging middleware
const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.path}:`, req.body);
  next();
};

router.post('/send-code', logRequest, sendVerificationCode);
router.post('/verify-code', logRequest, verifyCode);
router.post('/register', logRequest, register);
router.post('/login', logRequest, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);
router.delete('/delete-photo', protect, deletePhoto);
router.delete('/account', protect, deleteAccount);
router.get('/all', protect, admin, getAllUsers);

module.exports = router;
