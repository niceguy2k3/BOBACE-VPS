const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const { authenticate } = require('../../middlewares/auth.middleware');
const isModerator = require('../../middlewares/isModerator');
const isAdmin = require('../../middlewares/isAdmin');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy danh sách người dùng (Moderator+)
router.get('/', isModerator, userController.getAllUsers);

// Lấy thông tin chi tiết người dùng (Moderator+)
router.get('/:id', isModerator, userController.getUserById);

// Cập nhật thông tin người dùng (Admin only)
router.put('/:id', isAdmin, userController.updateUser);

// Xóa người dùng (Admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

// Cập nhật vai trò người dùng (Admin only)
router.put('/:id/role', isAdmin, userController.updateUserRole);

// Xác minh người dùng (Moderator+)
router.put('/:id/verify', isModerator, userController.verifyUser);

// Cập nhật trạng thái premium (Admin only)
router.put('/:id/premium', isAdmin, userController.togglePremium);

// Cấm người dùng (Admin only)
router.put('/:id/ban', isAdmin, userController.banUser);

// Bỏ cấm người dùng (Admin only)
router.put('/:id/unban', isAdmin, userController.unbanUser);

// === Thao tác hàng loạt ===

// Xác minh nhiều người dùng (Moderator+)
router.put('/bulk/verify', isModerator, userController.bulkVerifyUsers);

// Cập nhật trạng thái premium cho nhiều người dùng (Admin only)
router.put('/bulk/premium', isAdmin, userController.bulkTogglePremium);

// Cấm nhiều người dùng (Admin only)
router.put('/bulk/ban', isAdmin, userController.bulkBanUsers);

// Bỏ cấm nhiều người dùng (Admin only)
router.put('/bulk/unban', isAdmin, userController.bulkUnbanUsers);

// Xóa nhiều người dùng (Admin only)
router.delete('/bulk/delete', isAdmin, userController.bulkDeleteUsers);

module.exports = router;