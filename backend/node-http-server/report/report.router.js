const express = require('express');
const router = express.Router();
const { createReport, getAllReports, updateReport } = require('./report.controller');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createReport);
router.get('/', protect, admin, getAllReports);
router.put('/:id', protect, admin, updateReport);

module.exports = router;
