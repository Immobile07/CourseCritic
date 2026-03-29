const User = require('../models/User.model');
const Course = require('../models/Course.model');

// GET /api/planner - Get the logged-in user's planned courses
exports.getPlanner = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'plannedCourses',
      model: 'Course'
    });
    res.json(user.plannedCourses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/planner/:courseId - Add a course to the planner
exports.addToPlanner = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user.userId);
    if (user.plannedCourses.map(id => id.toString()).includes(courseId)) {
      return res.status(400).json({ message: 'Course already in planner' });
    }

    user.plannedCourses.push(courseId);
    await user.save();
    res.json({ message: 'Course added to planner' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/planner/:courseId - Remove a course from the planner
exports.removeFromPlanner = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.user.userId);
    user.plannedCourses = user.plannedCourses.filter(id => id.toString() !== courseId);
    await user.save();
    res.json({ message: 'Course removed from planner' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
