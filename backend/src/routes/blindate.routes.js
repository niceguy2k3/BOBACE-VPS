const express = require('express');
const router = express.Router();
const blindateController = require('../controllers/blindate.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Middleware xác thực cho tất cả các routes
router.use(authenticate);

// Tạo một blindate mới
router.post('/', blindateController.createBlindate);

// Lấy danh sách blindate của người dùng
router.get('/', blindateController.getUserBlindates);

// Lấy danh sách địa điểm gợi ý cho cuộc hẹn
router.get('/locations/suggested', blindateController.getSuggestedLocations);

// Tìm kiếm người dùng phù hợp cho blindate
router.get('/matches/find', blindateController.findBlinDateMatches);

// Lấy chi tiết một blindate
router.get('/:blindateId', blindateController.getBlindate);

// Phản hồi lời mời blindate
router.post('/:blindateId/respond', blindateController.respondToBlindate);

// Cập nhật thông tin cuộc hẹn
router.put('/:blindateId', blindateController.updateBlindate);

// Đánh giá cuộc hẹn
router.post('/:blindateId/review', blindateController.reviewBlindate);

// Hủy cuộc hẹn
router.post('/:blindateId/cancel', blindateController.cancelBlindate);

// Tạo link video call cho cuộc hẹn trực tuyến
router.post('/:blindateId/video-call', blindateController.createVideoCallLink);

// === Thêm các routes mới cho tính năng chọn địa điểm và chat thương lượng ===

// Gửi vote địa điểm
router.post('/:blindateId/vote-location', blindateController.voteLocation);

// Kiểm tra trạng thái vote địa điểm
router.get('/:blindateId/location-status', blindateController.getLocationStatus);

// Tạo phòng chat thương lượng
router.post('/:blindateId/initiate-chat', blindateController.initiateNegotiationChat);

// Chốt địa điểm cuối cùng
router.post('/:blindateId/confirm-location', blindateController.confirmFinalLocation);

module.exports = router;