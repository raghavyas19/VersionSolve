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

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags: { type: [String], default: [] },
  timeLimit: { type: Number, default: 1 }, // in seconds
  memoryLimit: { type: Number, default: 256 }, // in MB
  testCases: { type: [testCaseSchema], default: [] },
  submissions: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  author: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  examples: { type: [exampleSchema], default: [] },
  isPublic: { type: Boolean, default: true },
  points: { type: Number, default: 100 }
});

module.exports = mongoose.model('Problem', problemSchema);