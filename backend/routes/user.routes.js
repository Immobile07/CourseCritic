const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

router.get('/planner', auth, userController.getPlanner);
router.post('/planner', auth, userController.addCourseToPlanner);
router.delete('/planner/:courseId', auth, userController.removeCourseFromPlanner);
router.post('/gpa/simulate', auth, userController.simulateGPA);

module.exports = router;
