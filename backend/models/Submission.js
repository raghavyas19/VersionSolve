const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseId: String,
  input: String,
  expectedOutput: String,
  output: String,
  success: Boolean,
  executionTime: Number,
  memoryUsage: Number,
  error: String,
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  results: { type: [testCaseResultSchema], default: [] },
  status: { type: String, enum: [
    'Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error'
  ], default: 'Pending' },
  verdict: { type: String },
  executionTime: { type: Number },
  memoryUsage: { type: Number },
  passedTests: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  aiReview: { type: mongoose.Schema.Types.Mixed }, // Optional, for future AI review integration
});

module.exports = mongoose.model('Submission', submissionSchema); 