const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Public routes (no authentication required)
// Upload avatar for registration
router.post('/register/avatar', uploadController.uploadAvatarForRegistration);

// Upload photos for registration
router.post('/register/photos', uploadController.uploadPhotosForRegistration);

// All other routes require authentication
router.use(authenticate);

// Upload single image
router.post('/image', uploadController.uploadImage);

// Upload avatar
router.post('/avatar', uploadController.uploadAvatar);

// Upload multiple images
router.post('/images', uploadController.uploadMultipleImages);

// Upload verification photo
router.post('/verification', uploadController.uploadVerificationPhoto);

// Delete image
router.delete('/image', uploadController.deleteImage);

module.exports = router;
