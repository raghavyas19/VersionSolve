const express = require('express');
const router = express.Router();
const compilerController = require('../controllers/compilerController');
const { validateCodeExecution } = require('../middlewares/validation');
const { codeExecutionLimiter } = require('../middlewares/rateLimiter');

router.post('/submit', codeExecutionLimiter, validateCodeExecution, compilerController.submitCode);

module.exports = router;    