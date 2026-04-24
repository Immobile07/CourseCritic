const User = require('../models/User.model');
const Course = require('../models/Course.model');

exports.getPlanner = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('plannedCourses');
    res.json(user.plannedCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCourseToPlanner = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { plannedCourses: req.body.courseId } },
      { new: true }
    ).populate('plannedCourses');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser.plannedCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeCourseFromPlanner = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { plannedCourses: req.params.courseId } },
      { new: true }
    ).populate('plannedCourses');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser.plannedCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.simulateGPA = async (req, res) => {
  try {
    const gradePoints = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;

    for (let item of req.body.courses) {
      if (!item.grade) continue;
      const course = await Course.findById(item.courseId);
      if (course && gradePoints[item.grade] !== undefined) {
        totalPoints += gradePoints[item.grade] * course.creditHours;
        totalCredits += course.creditHours;
      }
    }

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    res.json({ gpa, totalCredits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
