const Faculty = require('../models/Faculty.model');

exports.createFaculty = async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllFaculty = async (req, res) => {
  try {
    const facultyList = await Faculty.find();
    res.json(facultyList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('coursesTaught');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchFaculty = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    const faculty = await Faculty.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
