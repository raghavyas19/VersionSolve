const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Save a new submission
router.post('/', submissionController.createSubmission);

// Get submissions for a user/problem
router.get('/', submissionController.getSubmissions);

module.exports = router; 