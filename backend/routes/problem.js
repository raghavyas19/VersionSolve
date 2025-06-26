const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const compilerController = require('../controllers/compilerController');
const { authenticateJWT, requireAdmin } = require('../middlewares/auth');
const { validateProblemCreation, validateCodeExecution, validateId, validatePagination } = require('../middlewares/validation');
const { codeExecutionLimiter, adminLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.get('/list', validatePagination, problemController.getProblems);
router.get('/:id', validateId, problemController.getProblemById);

// Protected routes
router.post('/create', authenticateJWT, requireAdmin, adminLimiter, validateProblemCreation, problemController.createProblem);
router.post('/execute', codeExecutionLimiter, validateCodeExecution, compilerController.executeProblemCode);
router.post('/execute-custom', codeExecutionLimiter, validateCodeExecution, compilerController.executeCustomCode);

module.exports = router;