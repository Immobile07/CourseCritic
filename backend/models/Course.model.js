const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creditHours: { type: Number, required: true },
  taughtBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isElective: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  
  // New Grading Scheme Feature
  gradingScheme: {
    attendance: { type: Number, default: 5 },
    assignment: { type: Number, default: 15 },
    quiz: { type: Number, default: 15 },
    midterm: { type: Number, default: 25 },
    final: { type: Number, default: 40 },
    lab: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Auto-assign scheme based on Lab/Theory before saving to the database
// Using an async function here fixes the "next is not a function" error in Mongoose 9+
courseSchema.pre('save', async function() {
  if (this.isNew || this.isModified('title')) {
    // Check if the title suggests it's a lab/project heavy course
    const isLab = /lab|laboratory|project|interfacing|graphics|robotics/i.test(this.title);
    
    if (isLab) {
      this.gradingScheme = {
        attendance: 5, assignment: 15, quiz: 15, midterm: 20, final: 25, lab: 20
      };
    } else {
      this.gradingScheme = {
        attendance: 5, assignment: 15, quiz: 15, midterm: 25, final: 40, lab: 0
      };
    }
  }
});

module.exports = mongoose.model('Course', courseSchema);