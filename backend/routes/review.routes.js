const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, reviewController.createReview);
router.get('/course/:courseId', reviewController.getReviewsByCourse);

module.exports = router;
