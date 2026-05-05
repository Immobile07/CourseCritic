const { Payslip, CourseHistory, CourseResource } = require('../models/Feature.model');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const path = require('path');
const fs = require('fs');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_REPLACE_ME') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// --- UTILS ---
const GRADE_POINTS = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
const COST_PER_CREDIT = 20000 / 3;
const SEMESTER_FLAT_FEE = 10000;

function getScholarshipPercentage(cgpa) {
  if (cgpa >= 4.0) return 100; if (cgpa >= 3.95) return 75; if (cgpa >= 3.90) return 50; if (cgpa >= 3.85) return 25; if (cgpa >= 3.70) return 10; return 0;
}

function calculateFeeBreakdown(cgpa, totalCreditHours) {
  const tuitionFee = Math.round(totalCreditHours * COST_PER_CREDIT);
  const grossTotal = tuitionFee + SEMESTER_FLAT_FEE;
  const scholarshipPct = getScholarshipPercentage(cgpa);
  const scholarshipDeduction = Math.round(tuitionFee * scholarshipPct / 100);
  return { costPerCredit: COST_PER_CREDIT, tuitionFee, semesterFee: SEMESTER_FLAT_FEE, grossTotal, scholarshipPercentage: scholarshipPct, scholarshipDeduction, netPayable: grossTotal - scholarshipDeduction };
}

async function computeCGPA(userId, gradesMap) {
  const user = await User.findById(userId).populate('plannedCourses');
  let totalPoints = 0, totalCredits = 0, coursesData = [];
  for (const course of user.plannedCourses) {
    const grade = gradesMap[course._id.toString()];
    if (!grade || GRADE_POINTS[grade] === undefined) continue;
    totalPoints += GRADE_POINTS[grade] * course.creditHours;
    totalCredits += course.creditHours;
    coursesData.push({ courseCode: course.courseCode, title: course.title, creditHours: course.creditHours, grade });
  }
  return { cgpa: totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0, totalCredits, coursesData };
}

exports.snapshotCourse = async (courseDoc, changedFields = [], userId = null, changeNote = '') => {
  try {
    const lastVersion = await CourseHistory.findOne({ course: courseDoc._id }, {}, { sort: { version: -1 } });
    const snapshot = { courseCode: courseDoc.courseCode, title: courseDoc.title, description: courseDoc.description, creditHours: courseDoc.creditHours, isElective: courseDoc.isElective, prerequisites: courseDoc.prerequisites || [], syllabus: courseDoc.syllabus || '' };
    await CourseHistory.create({ course: courseDoc._id, version: lastVersion ? lastVersion.version + 1 : 1, snapshot, changedFields, changedBy: userId, changeNote });
  } catch (err) { console.error('[History] Failed to save course snapshot:', err.message); }
};

// --- PAYSLIP CONTROLLERS ---
exports.previewPayslip = async (req, res) => {
  try {
    const { semester, grades } = req.body;
    if (!grades) return res.status(400).json({ error: 'grades object is required' });
    const { cgpa, totalCredits, coursesData } = await computeCGPA(req.user.userId, grades);
    if (totalCredits === 0) return res.status(400).json({ error: 'No graded courses found in planner.' });
    res.json({ semester: semester || 'Current Semester', cgpa, totalCredits, courses: coursesData, ...calculateFeeBreakdown(cgpa, totalCredits) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createStripeSession = async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env' });
    const { semester, grades } = req.body;
    const { cgpa, totalCredits, coursesData } = await computeCGPA(req.user.userId, grades);
    if (totalCredits === 0) return res.status(400).json({ error: 'No graded courses found in planner.' });
    const fees = calculateFeeBreakdown(cgpa, totalCredits);
    const payslip = await Payslip.create({ user: req.user.userId, semester: semester || 'Current Semester', cgpa, totalCreditHours: totalCredits, courses: coursesData, ...fees, paymentStatus: 'pending' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], mode: 'payment', customer_email: req.user.email,
      line_items: [{ price_data: { currency: 'bdt', product_data: { name: `Semester Fee — ${semester || 'Current Semester'}` }, unit_amount: fees.netPayable * 100 }, quantity: 1 }],
      metadata: { payslipId: payslip._id.toString() },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payslip?success=true&payslipId=${payslip._id}`, cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payslip?cancelled=true`,
    });
    await Payslip.findByIdAndUpdate(payslip._id, { stripeSessionId: session.id });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(503).send('Stripe not configured');
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.metadata?.payslipId) await Payslip.findByIdAndUpdate(session.metadata.payslipId, { paymentStatus: 'paid', stripePaymentIntentId: session.payment_intent, paidAt: new Date() });
    }
    res.json({ received: true });
  } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }
};

exports.getMyPayslips = async (req, res) => {
  try { res.json(await Payslip.find({ user: req.user.userId }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

// --- HISTORY & RESOURCES CONTROLLERS ---
exports.getCourseHistory = async (req, res) => {
  try { res.json(await CourseHistory.find({ course: req.params.courseId }).sort({ version: -1 }).populate('changedBy', 'username')); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCourseResources = async (req, res) => {
  try { res.json(await CourseResource.find({ course: req.params.courseId }).sort({ createdAt: -1 }).populate('uploadedBy', 'username')); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addResource = async (req, res) => {
  try {
    const { title, description, resourceType, url } = req.body;
    if (!await Course.findById(req.params.courseId)) return res.status(404).json({ error: 'Course not found' });
    if (!title || !resourceType) return res.status(400).json({ error: 'title and resourceType are required' });
    let data = { course: req.params.courseId, uploadedBy: req.user.userId, title, description: description || '', resourceType };
    if (resourceType === 'link') {
      if (!url) return res.status(400).json({ error: 'url is required' });
      data.url = url;
    } else {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      Object.assign(data, { filePath: req.file.path, originalFileName: req.file.originalname, fileSizeBytes: req.file.size, mimeType: req.file.mimetype });
    }
    const resource = await CourseResource.create(data);
    res.status(201).json(await resource.populate('uploadedBy', 'username'));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await CourseResource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ error: 'Not found' });
    if (resource.uploadedBy.toString() !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    if (resource.filePath && fs.existsSync(resource.filePath)) fs.unlinkSync(resource.filePath);
    await CourseResource.findByIdAndDelete(req.params.resourceId);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.serveFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.download(filePath);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
