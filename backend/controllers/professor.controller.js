const Professor = require('../models/Professor.model');

exports.createProfessor = async (req, res) => {
  try {
    const professor = new Professor(req.body);
    await professor.save();
    res.status(201).json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllProfessors = async (req, res) => {
  try {
    const professors = await Professor.find();
    res.json(professors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id).populate('coursesTaught');
    if (!professor) return res.status(404).json({ message: 'Professor not found' });
    res.json(professor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
