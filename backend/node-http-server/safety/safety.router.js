const express = require('express');
const router = express.Router();
const { createReport, getAllReports, updateReport, startTracking, getTracking, endTracking, sendEmergencyAlert } = require('./safety.controller');
const { protect, admin } = require('../middleware/auth');

router.post('/report', protect, createReport);
router.get('/reports', protect, admin, getAllReports);
router.put('/report/:id', protect, admin, updateReport);
router.post('/tracking', protect, startTracking);
router.get('/tracking/:bookingId', protect, getTracking);
router.put('/tracking/:bookingId/end', protect, endTracking);
router.post('/emergency', protect, sendEmergencyAlert);

module.exports = router;
