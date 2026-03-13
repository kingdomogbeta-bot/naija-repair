const Review = require('./review.schema');
const Tasker = require('../tasker/tasker.schema');
const Booking = require('../booking/booking.schema');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, taskerId, taskerEmail, rating, comment, service } = req.body;

    if (!bookingId || !taskerId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }

    const review = await Review.create({
      bookingId,
      taskerId,
      taskerEmail: taskerEmail || booking.taskerEmail,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      rating,
      comment,
      service: service || booking.service
    });

    const reviews = await Review.find({ taskerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await Tasker.findByIdAndUpdate(taskerId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount
    });

    if (global.io) {
      global.io.to(taskerId).emit('new_review', review);
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ taskerId: req.params.taskerId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingReview = async (req, res) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    const reviews = await Review.find({ taskerId: review.taskerId });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Tasker.findByIdAndUpdate(review.taskerId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
      });
    } else {
      await Tasker.findByIdAndUpdate(review.taskerId, {
        rating: 0,
        reviewCount: 0
      });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
