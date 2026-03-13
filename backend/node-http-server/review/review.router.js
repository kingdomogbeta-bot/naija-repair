const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { protect } = require('../middleware/auth');

router.post('/create', protect, reviewController.createReview);
router.get('/tasker/:taskerId', reviewController.getTaskerReviews);
router.get('/user', protect, reviewController.getUserReviews);
router.get('/booking/:bookingId', reviewController.getBookingReview);
router.delete('/:id', protect, reviewController.deleteReview);
router.get('/all', reviewController.getAllReviews);

module.exports = router;
