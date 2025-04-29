const express = require('express');
const router = express.Router();
const matchController = require('../../controllers/admin.match.controller');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy danh sách matches (Moderator+)
router.get('/', isModeratorOrAdmin, matchController.getAllMatches);

// Lấy thông tin chi tiết match (Moderator+)
router.get('/:id', isModeratorOrAdmin, matchController.getMatchById);

// Không có API cập nhật trạng thái match

// Xóa match (Admin only)
router.delete('/:id', isAdmin, matchController.deleteMatch);

module.exports = router;