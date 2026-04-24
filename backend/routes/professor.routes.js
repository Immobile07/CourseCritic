const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professor.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, professorController.createProfessor);
router.get('/', professorController.getAllProfessors);
router.get('/:id', professorController.getProfessorById);

module.exports = router;
