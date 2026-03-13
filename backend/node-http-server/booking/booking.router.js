const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { protect } = require('../middleware/auth');
const { protectTasker } = require('../middleware/taskerAuth');

router.post('/create', protect, bookingController.createBooking);
router.get('/user', protect, bookingController.getUserBookings);
router.get('/tasker', protectTasker, bookingController.getTaskerBookings);
router.get('/all', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/accept', protectTasker, bookingController.acceptBooking);
router.put('/:id/decline', protectTasker, bookingController.declineBooking);
router.put('/:id/start', protectTasker, bookingController.startBooking);
router.put('/:id/tasker-complete', protectTasker, bookingController.taskerCompleteBooking);
router.put('/:id/complete', protect, bookingController.completeBooking);
router.put('/:id/cancel', protect, bookingController.cancelBooking);
router.put('/:id/status', protect, bookingController.updateBookingStatus);
router.put('/:id/report-no-show', protect, bookingController.reportNoShow);
router.put('/:id/confirm-arrival', protectTasker, bookingController.confirmArrival);
router.put('/:id/request-refund', protect, bookingController.requestRefund);
router.get('/:id/status', bookingController.getBookingStatus);
router.get('/overdue/all', bookingController.getOverdueBookings);
router.delete('/:id', protect, bookingController.deleteBooking);
router.put('/:id/payment-status', bookingController.updatePaymentStatus);

module.exports = router;
