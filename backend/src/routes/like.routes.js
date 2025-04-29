const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Create like or dislike
router.post('/', likeController.createLike);

// Get likes limit info
router.get('/limit', likeController.getLikesLimit);

module.exports = router;