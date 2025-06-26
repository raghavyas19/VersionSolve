const Submission = require('../models/Submission');
const { asyncHandler } = require('../middlewares/errorHandler');

// Save a new submission
exports.createSubmission = asyncHandler(async (req, res) => {
  const { user, problem, code, language, results, status, verdict, executionTime, memoryUsage, passedTests, totalTests, aiReview } = req.body;
  
  if (!user || !problem || !code || !language || !results) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const submission = new Submission({
    user,
    problem,
    code,
    language,
    results,
    status,
    verdict,
    executionTime,
    memoryUsage,
    passedTests,
    totalTests,
    aiReview
  });

  await submission.save();
  res.status(201).json({ message: 'Submission saved', submission });
});

// Get submissions for a user/problem
exports.getSubmissions = asyncHandler(async (req, res) => {
  const { userId, problemId } = req.query;
  const filter = {};
  
  if (userId) filter.user = userId;
  if (problemId) filter.problem = problemId;
  
  const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
  res.status(200).json(submissions);
}); 