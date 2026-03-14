const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const { protect, admin } = require('../middleware/auth');

router.get('/admin/all', protect, admin, messageController.getAllMessagesAdmin);
router.post('/send', protect, messageController.sendMessage);
router.get('/conversation/:userId', protect, messageController.getConversation);
router.get('/conversations', protect, messageController.getAllConversations);
router.get('/unread-count', protect, messageController.getUnreadCount);
router.put('/read/:userId', protect, messageController.markAsRead);
router.delete('/:id', protect, messageController.deleteMessage);

module.exports = router;
