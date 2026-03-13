const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { protect, admin } = require('../middleware/auth');

router.get('/all', settingsController.getAllSettings);
router.get('/:key', settingsController.getSetting);
router.put('/update', protect, admin, settingsController.updateSetting);

module.exports = router;
