const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get potential matches (users to swipe)
router.get('/', userController.getPotentialMatches);

// Get blocked users
router.get('/blocked', userController.getBlockedUsers);

// Update user avatar
router.put('/avatar', userController.updateAvatar);

// Change password
router.put('/password', userController.changePassword);

// Update user settings
router.put('/settings', userController.updateSettings);

// Toggle incognito mode
router.post('/incognito', userController.toggleIncognitoMode);

// Block a user
router.post('/block/:userId', userController.blockUser);

// Unblock a user
router.delete('/block/:userId', userController.unblockUser);

// Report a user
router.post('/report', userController.reportUser);

// Delete account
router.delete('/account', userController.deleteAccount);

// Get user by ID - phải đặt sau các route cụ thể để tránh xung đột
router.get('/:id', userController.getUserById);

// Update user profile
router.put('/:id', userController.updateProfile);

module.exports = router;