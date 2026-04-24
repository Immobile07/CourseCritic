const Review = require('../models/Review.model');


function getCurrentSemesterBounds() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 1 && month <= 6) {
    return {
      label: `Spring ${year}`,
      start: new Date(`${year}-01-01T00:00:00.000Z`),
      end: new Date(`${year}-06-30T23:59:59.999Z`),
    };
  } else {
    return {
      label: `Fall ${year}`,
      start: new Date(`${year}-07-01T00:00:00.000Z`),
      end: new Date(`${year}-12-31T23:59:59.999Z`),
    };
  }
}


const REVIEW_LIMIT_PER_SEMESTER = 1;


const reviewRateLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const courseId = req.body.courseId;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required in the request body.' });
    }

    const { label, start, end } = getCurrentSemesterBounds();


    const existingCount = await Review.countDocuments({
      course: courseId,
      author: userId,
      createdAt: { $gte: start, $lte: end },
    });

    if (existingCount >= REVIEW_LIMIT_PER_SEMESTER) {
      return res.status(429).json({
        message:
          `You have already submitted a review for this course during the ${label} semester. ` +
          `Only ${REVIEW_LIMIT_PER_SEMESTER} review per course per semester is allowed.`,
        semester: label,
        limit: REVIEW_LIMIT_PER_SEMESTER,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = reviewRateLimit;
