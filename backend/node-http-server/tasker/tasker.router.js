const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  getAllTaskers, 
  approveTasker, 
  deleteTasker,
  sendVerificationCode,
  verifyCode,
  suspendTasker,
  unsuspendTasker,
  uploadPhoto,
  deletePhoto,
  changePassword,
  submitVerification,
  approveVerification,
  rejectVerification,
  getMyProfile,
  getAllTaskersAdmin,
  getPendingTaskers,
  getRecentTaskers
} = require('./tasker.controller');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Logging middleware
const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.path}:`, req.body);
  next();
};

// Public routes
router.post('/send-verification', logRequest, sendVerificationCode);
router.post('/verify-code', logRequest, verifyCode);
router.post('/register', logRequest, register);
router.post('/login', logRequest, login);
router.get('/all', getAllTaskers);

// Protected routes (require tasker authentication)
router.get('/me', protect, getMyProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-photo', protect, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadPhoto);
router.delete('/delete-photo', protect, deletePhoto);
router.delete('/account', protect, deleteTasker);

// Admin routes
router.get('/admin/all', protect, admin, getAllTaskersAdmin);
router.get('/admin/pending', protect, admin, getPendingTaskers);
router.get('/recent', getRecentTaskers);
router.put('/approve/:id', protect, admin, approveTasker);
router.put('/suspend/:id', protect, admin, suspendTasker);
router.put('/unsuspend/:id', protect, admin, unsuspendTasker);
router.put('/verify/approve/:id', protect, admin, approveVerification);
router.put('/verify/reject/:id', protect, admin, rejectVerification);

// Verification submission
router.post('/submit-verification', protect, (req, res, next) => {
  upload.fields([{ name: 'ninPhoto', maxCount: 1 }, { name: 'passportPhoto', maxCount: 1 }])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, submitVerification);

module.exports = router;