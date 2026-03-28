const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creditHours: { type: Number, required: true },
  department: { type: String },
  prerequisites: [{ type: String }],
  taughtBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
