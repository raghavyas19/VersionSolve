const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const compilerController = require('../controllers/compilerController');

router.post('/create', problemController.createProblem);
router.get('/list', problemController.getProblems);
router.post('/execute', compilerController.executeProblemCode);
router.post('/execute-custom', compilerController.executeCustomCode);
router.get('/:id', problemController.getProblemById);

module.exports = router;