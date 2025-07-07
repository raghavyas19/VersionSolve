const Problem = require('../models/Problem');
const BaseController = require('./baseController');
const { asyncHandler } = require('../middlewares/errorHandler');
const DraftProblem = require('../models/DraftProblem');

function generate6DigitId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getUniqueProblemId() {
  let unique = false;
  let id;
  while (!unique) {
    id = generate6DigitId();
    const exists = await Problem.findOne({ problemId: id });
    if (!exists) unique = true;
  }
  return id;
}

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
    const problemId = await getUniqueProblemId();
    const problem = new Problem({
      problemId,
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
    // Only return public problems
    const problems = await this.model.find({ isPublic: true });
    // Get unique user submission counts for each problem
    const Submission = require('../models/Submission');
    const uniqueUserCounts = await Submission.aggregate([
      { $match: { problem: { $in: problems.map(p => p._id) } } },
      { $group: { _id: { problem: '$problem', user: '$user' } } },
      { $group: { _id: '$_id.problem', uniqueUsers: { $sum: 1 } } }
    ]);
    const uniqueUserMap = {};
    uniqueUserCounts.forEach(item => {
      uniqueUserMap[item._id.toString()] = item.uniqueUsers;
    });
    // Transform MongoDB documents to include id field for frontend compatibility
    const transformedProblems = problems.map(problem => {
      const problemObj = problem.toObject();
      problemObj.id = problemObj._id;
      problemObj.uniqueUserSubmissions = uniqueUserMap[problemObj._id.toString()] || 0;
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

  // Update a problem by ID
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateFields = { ...req.body };
    delete updateFields._id;
    delete updateFields.createdAt;
    const updatedProblem = await this.model.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updatedProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const problem = updatedProblem.toObject();
    problem.id = problem._id;
    res.status(200).json({ message: 'Problem updated successfully', problem });
  });

  // Delete a problem by ID
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.status(200).json({ message: 'Problem deleted successfully' });
  });

  // Create a draft problem
  createDraft = asyncHandler(async (req, res) => {
    const draft = new DraftProblem({ ...req.body, isPublic: false });
    await draft.save();
    res.status(201).json({ message: 'Draft saved', draft });
  });

  // Get all drafts for an author
  getDrafts = asyncHandler(async (req, res) => {
    const { author } = req.query;
    const drafts = await DraftProblem.find(author ? { author } : {});
    res.status(200).json(drafts);
  });

  // Update a draft by ID
  updateDraft = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await DraftProblem.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Draft not found' });
    res.status(200).json({ message: 'Draft updated', draft: updated });
  });

  // Delete a draft by ID
  deleteDraft = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await DraftProblem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Draft not found' });
    res.status(200).json({ message: 'Draft deleted' });
  });

  // Publish a draft (move to Problem collection)
  publishDraft = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const draft = await DraftProblem.findById(id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    // Validate required fields for publishing
    if (!draft.title || !draft.description || !draft.difficulty || !draft.testCases.length) {
      return res.status(400).json({ error: 'Draft is missing required fields for publishing.' });
    }
    const problemId = await getUniqueProblemId();
    const problem = new Problem({ ...draft.toObject(), problemId, isPublic: true });
    await problem.save();
    await DraftProblem.findByIdAndDelete(id);
    res.status(201).json({ message: 'Draft published as problem', problem });
  });

  // Toggle problem visibility
  toggleVisibility = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    problem.visible = !problem.visible;
    problem.isPublic = problem.visible;
    await problem.save();
    res.status(200).json({ message: 'Visibility updated', visible: problem.visible, isPublic: problem.isPublic });
  });
}

const problemController = new ProblemController();

module.exports = {
  createProblem: problemController.create,
  getProblems: problemController.getAll,
  getProblemById: problemController.getById,
  updateProblem: problemController.update,
  deleteProblem: problemController.delete,
  createDraft: problemController.createDraft,
  getDrafts: problemController.getDrafts,
  updateDraft: problemController.updateDraft,
  deleteDraft: problemController.deleteDraft,
  publishDraft: problemController.publishDraft,
  toggleVisibility: problemController.toggleVisibility
};