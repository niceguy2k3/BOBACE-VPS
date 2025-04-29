const express = require('express');
const router = express.Router();
const secretAdmirerController = require('../controllers/secretAdmirer.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get secret admirers count
router.get('/count', secretAdmirerController.getSecretAdmirersCount);

// Get blurred preview of secret admirers
router.get('/preview', secretAdmirerController.getSecretAdmirersPreview);

// Reveal secret admirer (premium feature)
router.post('/reveal/:id', secretAdmirerController.revealSecretAdmirer);

module.exports = router;