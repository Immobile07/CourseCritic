const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All chat routes require authentication
router.use(authMiddleware);

// Get list of users to chat with
router.get('/users', chatController.getUsers);

// Send a message
router.post('/send', chatController.sendMessage);

// Get conversation with a specific user
router.get('/conversation/:otherUserId', chatController.getConversation);

module.exports = router;
