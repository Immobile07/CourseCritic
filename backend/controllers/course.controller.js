const Course = require('../models/Course.model');
const Review = require('../models/Review.model');

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
    const courses = await Course.find();
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

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
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
