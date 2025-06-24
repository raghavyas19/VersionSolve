const Problem = require('../models/Problem');

exports.createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags = [],
      timeLimit = 1,
      memoryLimit = 256,
      testCases = [],
      submissions = 0,
      acceptanceRate = 0,
      author = 'admin',
      examples = [],
      isPublic = true,
      points = 100
    } = req.body;
    if (!title || !description || !difficulty) {
      return res.status(400).json({ error: 'Title, description, and difficulty are required' });
    }
    const problem = new Problem({
      title,
      description,
      difficulty,
      tags,
      timeLimit,
      memoryLimit,
      testCases,
      submissions,
      acceptanceRate,
      author,
      examples,
      isPublic,
      points,
      createdAt: new Date()
    });
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

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};