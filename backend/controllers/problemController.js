const Problem = require('../models/Problem');

exports.createProblem = async (req, res) => {
  try {
    const { title, description, testCases, difficulty } = req.body;
    if (!title || !description || !difficulty) {
      return res.status(400).json({ error: 'Title, description, and difficulty are required' });
    }
    const problem = new Problem({ title, description, testCases, difficulty });
    await problem.save();
    res.status(201).json({ message: 'Problem created successfully', problem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};