const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticateJWT } = require('../middlewares/auth');
const { validateSubmission, validatePagination } = require('../middlewares/validation');
const { codeExecutionLimiter } = require('../middlewares/rateLimiter');

// All submission routes require authentication
router.use(authenticateJWT);

// Save a new submission
router.post('/', codeExecutionLimiter, validateSubmission, submissionController.createSubmission);

// Get submissions for a user/problem
router.get('/', validatePagination, submissionController.getSubmissions);

// Get user stats (solved problems and submissions)
router.get('/stats', submissionController.getUserStats);

// Get list of solved problem IDs for the authenticated user
router.get('/solved', submissionController.getSolvedProblems);

module.exports = router; 