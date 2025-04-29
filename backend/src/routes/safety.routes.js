const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Middleware xác thực cho hầu hết các routes
router.use('/emergency-report', authenticate);
router.use('/location-share', authenticate);
router.use('/cancel-location', authenticate);
router.use('/safe-locations/suggest', authenticate);
router.use('/safe-locations/:locationId/rate', authenticate);

// Báo cáo khẩn cấp
router.post('/emergency-report', safetyController.createEmergencyReport);

// Chia sẻ vị trí
router.post('/location-share', safetyController.createLocationShare);
router.put('/location/:trackingCode', safetyController.updateLocation);
router.get('/location/:trackingCode', safetyController.getLocationTracking);
router.post('/cancel-location/:trackingCode', safetyController.cancelLocationShare);

// Địa điểm an toàn
router.get('/safe-locations', safetyController.getSafeLocations);
router.post('/safe-locations/suggest', safetyController.suggestSafeLocation);
router.post('/safe-locations/:locationId/rate', safetyController.rateSafeLocation);

module.exports = router;