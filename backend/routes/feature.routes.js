const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth.middleware');
const featureController = require('../controllers/feature.controller');

// Upload setup
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `resource-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Payslip routes
router.post('/payslip/webhook', featureController.stripeWebhook); // Must use raw body parser
router.post('/payslip/preview', auth, featureController.previewPayslip);
router.post('/payslip/create-session', auth, featureController.createStripeSession);
router.get('/payslip/my', auth, featureController.getMyPayslips);

// History & Resource routes
router.get('/history/:courseId/versions', featureController.getCourseHistory);
router.get('/history/:courseId/resources', featureController.getCourseResources);
router.post('/history/:courseId/resources', auth, upload.single('file'), featureController.addResource);
router.delete('/history/:courseId/resources/:resourceId', auth, featureController.deleteResource);
router.get('/history/files/:filename', featureController.serveFile);

module.exports = router;
