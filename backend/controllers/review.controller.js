const Review = require('../models/Review.model');
const Course = require('../models/Course.model');
const Professor = require('../models/Professor.model');

exports.createReview = async (req, res) => {
  try {
    const { courseId, professorId, difficultyRating, usefulnessRating, workloadRating, writtenFeedback, isAnonymous } = req.body;
    
    const course = await Course.findById(courseId);
    const professor = await Professor.findById(professorId);
    if (!course || !professor) return res.status(404).json({ message: 'Course or Professor not found' });

    const review = new Review({
      course: courseId,
      professor: professorId,
      author: req.user.userId,
      difficultyRating,
      usefulnessRating,
      workloadRating,
      writtenFeedback,
      isAnonymous
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReviewsByCourse = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('author', 'username')
      .populate('professor', 'name');
    
    // Mask author if anonymous
    const result = reviews.map(r => {
      const reviewObj = r.toObject();
      if (reviewObj.isAnonymous && reviewObj.author) {
        reviewObj.author.username = 'Anonymous';
      }
      return reviewObj;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
