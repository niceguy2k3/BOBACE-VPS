const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Tạo báo cáo mới
router.post('/', upload.fields([{ name: 'evidence', maxCount: 5 }]), reportController.createReport);

// Lấy danh sách báo cáo của người dùng hiện tại
router.get('/my-reports', reportController.getUserReports);

// Lấy chi tiết báo cáo
router.get('/:id', reportController.getReportById);

// Cập nhật báo cáo
router.put('/:id', upload.fields([{ name: 'evidence', maxCount: 5 }]), reportController.updateReport);

// Xóa báo cáo
router.delete('/:id', reportController.deleteReport);

module.exports = router;