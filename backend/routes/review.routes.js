const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const reviewRateLimit = require('../middleware/reviewRateLimit.middleware');

router.post('/', auth, reviewRateLimit, reviewController.createReview);
router.post('/:id/report', auth, reviewController.reportReview);
router.get('/course/:courseId', reviewController.getReviewsByCourse);

module.exports = router;
