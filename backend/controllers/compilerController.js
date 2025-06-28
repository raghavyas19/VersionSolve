const Problem = require('../models/Problem');
const compilerService = require('../utils/compilerService');
const { asyncHandler } = require('../middlewares/errorHandler');

const MAX_TIMEOUT = 30000; // 30 seconds

exports.submitCode = asyncHandler(async (req, res) => {
  const { code, language, input, timeout } = req.body || {};
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  const safeTimeout = Math.min(Number(timeout) || 5000, MAX_TIMEOUT);
  const result = await compilerService.executeSingleCode(code, language, input, 'online', safeTimeout);

  res.status(200).json({
    result: result.output || '',
    status: result.error ? 'Execution failed' : 'Execution completed',
    compileError: result.error || null,
    runtimeError: null,
    executionTime: result.executionTime,
    memoryUsage: result.memoryUsage
  });
});

exports.executeProblemCode = asyncHandler(async (req, res) => {
  const { code, language, problemId } = req.body;
  
  if (!code || !language || !problemId) {
    return res.status(400).json({ error: 'Code, language, and problemId are required' });
  }

  const problem = await Problem.findById(problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const testCases = problem.testCases || [];
  const safeTimeout = Math.min(Number(problem.timeLimit * 1000) || 5000, MAX_TIMEOUT);
  const result = await compilerService.executeWithTestCases(code, language, testCases, 'problem', safeTimeout);

  res.status(200).json(result);
});

exports.executeCustomCode = asyncHandler(async (req, res) => {
  const { code, language, input, timeout } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  const safeTimeout = Math.min(Number(timeout) || 5000, MAX_TIMEOUT);
  const result = await compilerService.executeSingleCode(code, language, input, 'online', safeTimeout);

  // Return result in the format expected by frontend
  const formattedResult = {
    testCaseId: 'custom',
    input: input || '',
    expectedOutput: '',
    output: result.output || '',
    success: !result.error,
    executionTime: result.executionTime,
    memoryUsage: result.memoryUsage,
    error: result.error || null
  };

  res.status(200).json({
    results: [formattedResult],
    passedTests: !result.error ? 1 : 0,
    totalTests: 1
  });
}); 