const express = require('express');
const router = express.Router();
const supportController = require('./support.controller');
const { protect, admin } = require('../middleware/auth');

// User routes
router.post('/ticket', protect, supportController.createSupportTicket);
router.get('/tickets', protect, supportController.getUserSupportTickets);
router.get('/ticket/:ticketId', protect, supportController.getSupportTicket);
router.post('/ticket/:ticketId/message', protect, supportController.addMessageToTicket);

// Admin routes
router.get('/admin/tickets', protect, admin, supportController.getAllSupportTickets);
router.put('/admin/ticket/:ticketId/status', protect, admin, supportController.updateTicketStatus);
router.post('/admin/ticket/:ticketId/reply', protect, admin, supportController.adminReplyToTicket);

module.exports = router;