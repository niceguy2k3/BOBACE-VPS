const express = require('express');
const router = express.Router();
const safetyController = require('../../controllers/admin/safetyController');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy danh sách báo cáo an toàn (Moderator+)
router.get('/reports', isModeratorOrAdmin, safetyController.getAllSafetyReports);

// Lấy thông tin chi tiết báo cáo an toàn (Moderator+)
router.get('/reports/:id', isModeratorOrAdmin, safetyController.getSafetyReportById);

// Cập nhật trạng thái báo cáo an toàn (Moderator+)
router.patch('/reports/:id/status', isModeratorOrAdmin, safetyController.updateSafetyReportStatus);

// Lấy danh sách địa điểm có vấn đề an toàn (Moderator+)
router.get('/locations', isModeratorOrAdmin, safetyController.getSafetyLocations);

// Cập nhật trạng thái an toàn của địa điểm (Moderator+)
router.patch('/locations/:id/status', isModeratorOrAdmin, safetyController.updateSafetyLocationStatus);

module.exports = router;