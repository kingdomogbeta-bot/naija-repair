const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { protect } = require('../middleware/auth');

router.post('/create', notificationController.createNotification);
router.get('/user', protect, notificationController.getUserNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
