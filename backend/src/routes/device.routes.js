const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Đăng ký thiết bị mới
router.post('/register', authenticate, deviceController.registerDevice);

// Cập nhật trạng thái hoạt động của thiết bị
router.put('/update-activity', authenticate, deviceController.updateDeviceActivity);

// Xóa thiết bị
router.delete('/unregister', authenticate, deviceController.unregisterDevice);

// Lấy danh sách thiết bị của người dùng
router.get('/', authenticate, deviceController.getUserDevices);

// Kiểm tra trạng thái đăng ký thiết bị
router.get('/check', authenticate, deviceController.checkDeviceRegistration);

// Gửi thông báo test
router.post('/test-notification', authenticate, deviceController.sendTestNotification);

module.exports = router;