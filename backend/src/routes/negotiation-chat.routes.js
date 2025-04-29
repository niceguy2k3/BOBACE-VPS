const express = require('express');
const router = express.Router();
const negotiationChatController = require('../controllers/negotiation-chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy tin nhắn trong phòng chat
router.get('/:chatRoomId/messages', negotiationChatController.getChatMessages);

// Gửi tin nhắn
router.post('/:chatRoomId/send', negotiationChatController.sendMessage);

// Lấy thông tin phòng chat
router.get('/:chatRoomId', negotiationChatController.getChatRoom);

// Đóng phòng chat
router.post('/:chatRoomId/close', negotiationChatController.closeChat);

module.exports = router;