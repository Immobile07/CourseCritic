const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  difficultyRating: { type: Number, required: true, min: 1, max: 5 },
  usefulnessRating: { type: Number, required: true, min: 1, max: 5 },
  workloadRating: { type: Number, required: true, min: 1, max: 5 },
  writtenFeedback: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
