const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  id: String,
  input: String,
  expectedOutput: String,
  isHidden: Boolean,
  timeLimit: Number,
  memoryLimit: Number,
  points: Number
}, { _id: false });

const draftProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String },
  tags: { type: [String], default: [] },
  timeLimit: { type: Number },
  memoryLimit: { type: Number },
  testCases: { type: [testCaseSchema], default: [] },
  submissions: { type: Number },
  acceptanceRate: { type: Number },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
  examples: { type: [exampleSchema], default: [] },
  isPublic: { type: Boolean, default: false },
  points: { type: Number }
});

module.exports = mongoose.model('DraftProblem', draftProblemSchema); 