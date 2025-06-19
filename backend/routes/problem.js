const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.post('/create', problemController.createProblem);
router.get('/list', problemController.getProblems);

module.exports = router;