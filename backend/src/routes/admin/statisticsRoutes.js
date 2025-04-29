const express = require('express');
const router = express.Router();
const statisticsController = require('../../controllers/admin/statisticsController');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy thống kê hoạt động (Moderator+)
router.get('/activity', isModeratorOrAdmin, statisticsController.getActivityStats);

module.exports = router;