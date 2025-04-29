const express = require('express');
const router = express.Router();
const systemController = require('../../controllers/admin/systemController');
const { authenticate, isAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy thông tin hệ thống (Admin only)
router.get('/stats', isAdmin, systemController.getSystemStats);

// Cập nhật chế độ bảo trì (Admin only)
router.put('/maintenance', isAdmin, systemController.toggleMaintenanceMode);

// Lấy log hệ thống (Admin only)
router.get('/logs', isAdmin, systemController.getSystemLogs);

// Kiểm tra và cập nhật trạng thái premium của người dùng (Admin only)
router.post('/check-premium', isAdmin, systemController.checkPremiumStatus);

module.exports = router;