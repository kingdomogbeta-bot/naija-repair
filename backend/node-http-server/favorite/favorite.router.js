const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('./favorite.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/', protect, addFavorite);
router.delete('/:taskerId', protect, removeFavorite);

module.exports = router;
