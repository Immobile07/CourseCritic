const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  coursesTaught: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

module.exports = mongoose.model('Professor', professorSchema);
