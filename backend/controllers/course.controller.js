const Course = require('../models/Course.model');
const Review = require('../models/Review.model');
const { snapshotCourse } = require('./feature.controller');

exports.getTopElectives = async (req, res) => {
  try {
    const topElectives = await Review.aggregate([
      { $group: { _id: "$course", avgUsefulness: { $avg: "$usefulnessRating" } } },
      { $sort: { avgUsefulness: -1 } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseData' } },
      { $unwind: "$courseData" },
      { $match: { "courseData.isElective": true } },
      { $limit: 3 }
    ]);
    res.json(topElectives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: true });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    const courses = await Course.find({
      isApproved: true,
      $or: [
        { courseCode: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('taughtBy')
      .populate('prerequisites');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCompanionCourses = async (req, res) => {
  try {
    const courseId = req.params.id;
    // Find all reviews for this course to identify users who took it
    const reviewsForCourse = await Review.find({ course: courseId }).select('author');
    const userIds = [...new Set(reviewsForCourse.map(r => r.author.toString()))];

    if (userIds.length === 0) {
      return res.json([]);
    }

    // Find all reviews by these users for OTHER courses
    const companionReviews = await Review.find({
      author: { $in: userIds },
      course: { $ne: courseId }
    });

    // Count frequency of each companion course
    const courseCounts = {};
    for (const r of companionReviews) {
      const cid = r.course.toString();
      courseCounts[cid] = (courseCounts[cid] || 0) + 1;
    }

    // Sort by count descending and take top 5
    const topCompanionIds = Object.keys(courseCounts)
      .sort((a, b) => courseCounts[b] - courseCounts[a])
      .slice(0, 5);

    if (topCompanionIds.length === 0) {
      return res.json([]);
    }

    // Fetch the actual course documents
    const companionCourses = await Course.find({ _id: { $in: topCompanionIds }, isApproved: true });
    
    // Sort courses in the same order as topCompanionIds
    const result = topCompanionIds
      .map(id => companionCourses.find(c => c._id.toString() === id))
      .filter(Boolean);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // Auto-snapshot the updated course for historical tracking
    const changedFields = Object.keys(req.body);
    await snapshotCourse(course, changedFields, req.user?.userId, req.body.changeNote || '');
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
