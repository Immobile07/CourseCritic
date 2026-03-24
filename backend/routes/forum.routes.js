const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', forumController.getTopics);
router.get('/:id', forumController.getTopicById);

router.post('/', authMiddleware, forumController.createTopic);
router.post('/:id/answers', authMiddleware, forumController.createAnswer);

module.exports = router;
