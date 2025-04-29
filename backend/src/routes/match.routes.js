const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all matches for current user
router.get('/', matchController.getMatches);

// Get match by ID
router.get('/:id', matchController.getMatchById);

// Delete match (unmatch)
router.delete('/:id', matchController.deleteMatch);

// Get messages for a match
router.get('/:matchId/messages', messageController.getMessages);

// Create a new message
router.post('/:matchId/messages', messageController.createMessage);

module.exports = router;