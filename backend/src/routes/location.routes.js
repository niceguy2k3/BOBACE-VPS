const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Lấy danh sách địa điểm gợi ý
router.get('/suggested', authenticate , locationController.getSuggestedLocations);

module.exports = router;