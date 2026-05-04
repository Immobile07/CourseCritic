const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');

// All admin routes are protected by auth and adminAuth
router.use(auth, adminAuth);

// Courses
router.get('/courses/unapproved', adminController.getUnapprovedCourses);
router.put('/courses/:id/approve', adminController.approveCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Reviews
router.get('/reviews/reported', adminController.getReportedReviews);
router.put('/reviews/:id/dismiss', adminController.dismissReport);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;
