const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creditHours: { type: Number, required: true },
  taughtBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isElective: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
