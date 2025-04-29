const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/admin/reportController');
const { authenticate, isAdmin, isModeratorOrAdmin } = require('../../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticate);

// Lấy danh sách báo cáo (Moderator+)
router.get('/', isModeratorOrAdmin, reportController.getAllReports);

// Lấy thông tin chi tiết báo cáo (Moderator+)
router.get('/:id', isModeratorOrAdmin, reportController.getReportById);

// Cập nhật trạng thái báo cáo (Moderator+)
router.patch('/:id/status', isModeratorOrAdmin, reportController.updateReportStatus);
// Thêm route PUT để hỗ trợ cả hai phương thức
router.put('/:id/status', isModeratorOrAdmin, reportController.updateReportStatus);
// Thêm route POST để hỗ trợ method override
router.post('/:id/status', isModeratorOrAdmin, (req, res, next) => {
  // Nếu có _method=PATCH, xử lý như PATCH request
  if (req.body._method === 'PATCH') {
    // Xóa _method khỏi body để không ảnh hưởng đến logic xử lý
    delete req.body._method;
    return reportController.updateReportStatus(req, res, next);
  }
  // Nếu không, xử lý như POST bình thường
  next();
});

// Ban người dùng từ báo cáo (Admin only)
router.post('/:id/ban-user', isAdmin, reportController.banUserFromReport);

module.exports = router;