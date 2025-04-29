const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middlewares/auth.middleware');


// All routes require authentication
router.use(authenticate);

// Get unread messages
router.get('/unread', messageController.getUnreadMessages);

// Mark message as read
router.put('/:id/read', messageController.markAsRead);

// Mark all messages in a match as read
router.post('/read/:matchId', messageController.markAllAsRead);

module.exports = router;