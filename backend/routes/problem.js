const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const compilerController = require('../controllers/compilerController');
const { authenticateJWT, requireAdmin } = require('../middlewares/auth');
const { validateProblemCreation, validateCodeExecution, validateId, validatePagination } = require('../middlewares/validation');
const { codeExecutionLimiter, adminLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.get('/list', validatePagination, problemController.getProblems);
router.get('/drafts', problemController.getDrafts);
router.get('/:id', validateId, problemController.getProblemById);

// Protected routes
router.post('/create', authenticateJWT, requireAdmin, adminLimiter, validateProblemCreation, problemController.createProblem);
router.post('/execute', codeExecutionLimiter, validateCodeExecution, compilerController.executeProblemCode);
router.post('/execute-custom', codeExecutionLimiter, validateCodeExecution, compilerController.executeCustomCode);
router.put('/:id', authenticateJWT, requireAdmin, problemController.updateProblem);
router.delete('/:id', authenticateJWT, requireAdmin, problemController.deleteProblem);
router.put('/:id/visibility', authenticateJWT, requireAdmin, problemController.toggleVisibility);

// Draft problem routes
router.post('/draft', problemController.createDraft);
router.put('/draft/:id', problemController.updateDraft);
router.delete('/draft/:id', problemController.deleteDraft);
router.post('/draft/:id/publish', problemController.publishDraft);

module.exports = router;