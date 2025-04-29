const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', authenticate, authController.getCurrentUser);

// Email verification
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// Forgot password - request reset
router.post('/forgot-password', authController.forgotPassword);

// Verify reset code
router.post('/verify-reset-code', authController.verifyResetCode);

// Reset password with code
router.post('/reset-password', authController.resetPassword);

// Test email connection
router.get('/test-email', authController.testEmail);

module.exports = router;