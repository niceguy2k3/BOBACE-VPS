const express = require('express');
const router = express.Router();
const blindateController = require('../../controllers/admin.blindate.controller');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy danh sách blindates (Moderator+)
router.get('/', isModeratorOrAdmin, blindateController.getAllBlindates);

// Lấy thông tin chi tiết blindate (Moderator+)
router.get('/:id', isModeratorOrAdmin, blindateController.getBlindateById);

// Cập nhật trạng thái blindate (Moderator+)
router.put('/:id', isModeratorOrAdmin, blindateController.updateBlindateStatus);

// Xóa blindate (Admin only)
router.delete('/:id', isAdmin, blindateController.deleteBlinddate);

module.exports = router;