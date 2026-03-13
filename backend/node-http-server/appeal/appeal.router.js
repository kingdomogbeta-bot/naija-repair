const express = require('express');
const router = express.Router();
const { submitAppeal, getAllAppeals, updateAppeal } = require('./appeal.controller');
const { protect, admin } = require('../middleware/auth');

router.post('/', submitAppeal);
router.get('/', protect, admin, getAllAppeals);
router.put('/:id', protect, admin, updateAppeal);

module.exports = router;
