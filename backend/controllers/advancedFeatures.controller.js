const Course = require('../models/Course.model');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Course.distinct('department');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCoursesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const courses = await Course.find({ department });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const course = await Course.findOne({ courseCode: code }).populate('taughtBy');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
