const Problem = require('../models/Problem');
const BaseController = require('./baseController');
const { asyncHandler } = require('../middlewares/errorHandler');

class ProblemController extends BaseController {
  constructor() {
    super(Problem);
  }

  // Override create method to add custom validation
  create = asyncHandler(async (req, res) => {
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
  });

  // Override getAll to remove pagination for problems list
  getAll = asyncHandler(async (req, res) => {
    const problems = await this.model.find();
    
    // Transform MongoDB documents to include id field for frontend compatibility
    const transformedProblems = problems.map(problem => {
      const problemObj = problem.toObject();
      problemObj.id = problemObj._id;
      return problemObj;
    });
    
    res.status(200).json(transformedProblems);
  });

  // Override getById to return the document directly for frontend compatibility
  getById = asyncHandler(async (req, res) => {
    const document = await this.model.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Transform MongoDB document to include id field for frontend compatibility
    const problem = document.toObject();
    problem.id = problem._id;
    
    res.status(200).json(problem);
  });
}

const problemController = new ProblemController();

module.exports = {
  createProblem: problemController.create,
  getProblems: problemController.getAll,
  getProblemById: problemController.getById
};