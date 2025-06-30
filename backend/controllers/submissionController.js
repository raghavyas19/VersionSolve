const Submission = require('../models/Submission');
const { asyncHandler } = require('../middlewares/errorHandler');
const mongoose = require('mongoose');

// Save a new submission
exports.createSubmission = asyncHandler(async (req, res) => {
  const { problem, code, language, results, status, verdict, executionTime, memoryUsage, passedTests, totalTests, aiReview } = req.body;

  // Validate required fields
  if (!problem || !code || !language || !results) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields: problem, code, language, and results are required' 
    });
  }

  // Use authenticated user from req.user
  const userId = req.user.id;

  const submission = new Submission({
    user: userId,
    problem,
    code,
    language,
    results,
    status: status || 'Pending',
    verdict: verdict || status || 'Pending',
    executionTime: executionTime || 0,
    memoryUsage: memoryUsage || 0,
    passedTests: passedTests || 0,
    totalTests: totalTests || 0,
    aiReview
  });

  await submission.save();
  
  res.status(201).json({ 
    success: true,
    message: 'Submission saved successfully', 
    submission 
  });
});

// Get submissions for a user/problem
exports.getSubmissions = asyncHandler(async (req, res) => {
  const { problemId, page = 1, limit = 20 } = req.query;
  const filter = {};

  // Always filter by the authenticated user
  filter.user = req.user.id;
  
  if (problemId) filter.problem = problemId;

  const skip = (page - 1) * limit;

  const submissions = await Submission.find(filter)
    .populate('problem', 'title difficulty tags')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Submission.countDocuments(filter);

  res.status(200).json({
    success: true,
    submissions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get user stats: total submissions and solved problems
exports.getUserStats = asyncHandler(async (req, res) => {
  console.log('getUserStats req.user:', req.user);
  const userId = req.user.id;
  // Total submissions
  const totalSubmissions = await Submission.countDocuments({ user: userId });
  // Unique problems with at least one Accepted submission
  const solvedProblems = await Submission.aggregate([
    { $match: { user: req.user._id, status: 'Accepted' } },
    { $group: { _id: '$problem' } },
    { $count: 'count' }
  ]);
  res.status(200).json({
    success: true,
    totalSubmissions,
    solvedProblems: solvedProblems[0]?.count || 0
  });
});

// Get list of solved problem IDs for the authenticated user
exports.getSolvedProblems = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  // Aggregate unique problem IDs with at least one Accepted submission
  const solved = await Submission.aggregate([
    { $match: { user: req.user._id, status: 'Accepted' } },
    { $group: { _id: '$problem' } }
  ]);
  const solvedProblemIds = solved.map(item => item._id.toString());
  res.status(200).json({
    success: true,
    solvedProblemIds
  });
}); 