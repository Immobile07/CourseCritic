const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/planner.controller');
const auth = require('../middleware/auth.middleware');

// All planner routes require authentication
router.get('/', auth, plannerController.getPlanner);
router.post('/:courseId', auth, plannerController.addToPlanner);
router.delete('/:courseId', auth, plannerController.removeFromPlanner);

module.exports = router;
