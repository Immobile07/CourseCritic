const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  cgpa: { type: Number, required: true },
  totalCreditHours: { type: Number, required: true },
  courses: [{ courseCode: String, title: String, creditHours: Number, grade: String }],
  costPerCredit: { type: Number, default: 6666.67 },
  tuitionFee: { type: Number, required: true },
  semesterFee: { type: Number, default: 10000 },
  grossTotal: { type: Number, required: true },
  scholarshipPercentage: { type: Number, default: 0 },
  scholarshipDeduction: { type: Number, default: 0 },
  netPayable: { type: Number, required: true },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'waived'], default: 'pending' },
  paidAt: { type: Date }
}, { timestamps: true });

const courseHistorySchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  version: { type: Number, required: true },
  snapshot: { courseCode: String, title: String, description: String, creditHours: Number, isElective: Boolean, prerequisites: [String], syllabus: String },
  changedFields: [String],
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeNote: { type: String, default: '' },
}, { timestamps: true });

const courseResourceSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  resourceType: { type: String, enum: ['link', 'pdf', 'file'], required: true },
  url: { type: String },
  filePath: { type: String },
  originalFileName: { type: String },
  fileSizeBytes: { type: Number },
  mimeType: { type: String },
}, { timestamps: true });

module.exports = {
  Payslip: mongoose.model('Payslip', payslipSchema),
  CourseHistory: mongoose.model('CourseHistory', courseHistorySchema),
  CourseResource: mongoose.model('CourseResource', courseResourceSchema)
};
