const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Tạo báo cáo mới (evidence là base64 string hoặc array of base64 strings)
router.post('/', reportController.createReport);

// Lấy danh sách báo cáo của người dùng hiện tại
router.get('/my-reports', reportController.getUserReports);

// Lấy chi tiết báo cáo
router.get('/:id', reportController.getReportById);

// Cập nhật báo cáo (evidence là base64 string hoặc array of base64 strings)
router.put('/:id', reportController.updateReport);

// Xóa báo cáo
router.delete('/:id', reportController.deleteReport);

module.exports = router;