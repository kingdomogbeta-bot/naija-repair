const express = require('express');
const router = express.Router();
const { getAllServices, createService, updateService, deleteService } = require('./service.controller');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllServices);
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
