const express = require('express');
const router = express.Router();
const advancedController = require('../controllers/advancedFeatures.controller');

// Department Filtering
router.get('/departments', advancedController.getDepartments);
router.get('/departments/:department', advancedController.getCoursesByDepartment);

// Prerequisite Linking (get by course code)
router.get('/course/:code', advancedController.getCourseByCode);

module.exports = router;
