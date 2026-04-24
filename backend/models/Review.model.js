const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  difficultyRating: { type: Number, required: true, min: 1, max: 5 },
  usefulnessRating: { type: Number, required: true, min: 1, max: 5 },
  workloadRating: { type: Number, required: true, min: 1, max: 5 },
  writtenFeedback: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  reports: [{
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
