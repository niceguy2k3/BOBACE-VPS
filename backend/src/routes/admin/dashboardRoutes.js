const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy thống kê dashboard (Moderator+)
router.get('/', isModeratorOrAdmin, dashboardController.getDashboardStats);

// Lấy hoạt động gần đây (Moderator+)
router.get('/recent-activity', isModeratorOrAdmin, dashboardController.getRecentActivity);

module.exports = router;