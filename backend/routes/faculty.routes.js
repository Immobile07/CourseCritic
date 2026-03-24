const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, facultyController.createFaculty);
router.get('/', facultyController.getAllFaculty);
router.get('/search', facultyController.searchFaculty);
router.get('/:id', facultyController.getFacultyById);

module.exports = router;
