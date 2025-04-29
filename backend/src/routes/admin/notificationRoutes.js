const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/admin/notificationController');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy danh sách thông báo (Moderator+)
router.get('/', isModeratorOrAdmin, notificationController.getAllNotifications);

// Tạo thông báo mới (Admin only)
router.post('/', isAdmin, notificationController.createNotification);

// Xóa thông báo (Admin only)
router.delete('/:id', isAdmin, notificationController.deleteNotification);

// Gửi thông báo hệ thống tới tất cả người dùng (Admin only)
router.post('/system', isAdmin, notificationController.sendSystemNotification);

module.exports = router;