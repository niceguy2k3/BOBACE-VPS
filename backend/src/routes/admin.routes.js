const express = require('express');
const router = express.Router();
    const userController = require('../controllers/admin/userController');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Import các route admin khác
const blindateRoutes = require('./admin/blindateRoutes');
const matchRoutes = require('./admin/matchRoutes');
const reportRoutes = require('./admin/reportRoutes');
const safetyRoutes = require('./admin/safetyRoutes');
const dashboardRoutes = require('./admin/dashboardRoutes');
const notificationRoutes = require('./admin/notificationRoutes');
const fixSubscriptionsRoutes = require('./admin/fix-subscriptions');
const systemRoutes = require('./admin/systemRoutes');
const statisticsRoutes = require('./admin/statisticsRoutes');

// Đảm bảo tất cả các routes đều yêu cầu xác thực
router.use(authenticate);

// Sử dụng các routes từ thư mục admin
router.get('/users', isAdmin, userController.getAllUsers);
router.get('/users/:id', isAdmin, userController.getUserById);
router.put('/users/:id', isAdmin, userController.updateUser);
router.delete('/users/:id', isAdmin, userController.deleteUser);
router.put('/users/:id/role', isAdmin, userController.updateUserRole);
router.put('/users/:id/verify', isAdmin, userController.verifyUser);
router.put('/users/:id/premium', isAdmin, userController.togglePremium);
router.put('/users/:id/ban', isAdmin, userController.banUser);
router.put('/users/:id/unban', isAdmin, userController.unbanUser);

// Đăng ký các route admin khác
router.use('/blindates', blindateRoutes);
router.use('/matches', matchRoutes);
router.use('/reports', reportRoutes);
router.use('/safety', safetyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', fixSubscriptionsRoutes);
router.use('/system', systemRoutes);
router.use('/statistics', statisticsRoutes);

module.exports = router;