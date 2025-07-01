export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'setter' | 'user';
  rating: number;
  solvedProblems: number;
  submissions: number;
  avatar?: string;
  profilePhotoUrl?: string;
  joinedAt: Date;
  name?: string;
  isEmailVerified?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  testCases: TestCase[];
  submissions: number;
  acceptanceRate: number;
  author: string;
  createdAt: Date;
  examples: Example[];
  isPublic: boolean;
  points: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  timeLimit?: number;
  memoryLimit?: number;
  points?: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: string;
  code: string;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  verdict?: string;
  executionTime?: number; // in ms
  memoryUsage?: number; // in MB
  passedTests: number;
  totalTests: number;
  submittedAt: Date;
  aiReview?: AIReview;
}

export interface AIReview {
  codeQuality: number; // 1-10
  optimizationSuggestions: string[];
  complexityAnalysis: {
    time: string;
    space: string;
  };
  styleIssues: string[];
  plagiarismScore: number; // 0-100
  readabilityScore: number; // 1-10
  bestPractices: string[];
  securityIssues: string[];
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  problems: string[]; // problem IDs
  participants: number;
  status: 'Upcoming' | 'Running' | 'Ended';
  type: 'Individual' | 'Team';
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  problemsSolved: number;
  penalty: number; // in minutes
  lastSubmission: Date;
}

export interface CompilerOutput {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  exitCode: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  executionTime: number;
  memoryUsage: number;
  error?: string; // Optional error message
  compileError?: string; // Optional compilation error
  runtimeError?: string; // Optional runtime error
}

export interface AIReview {
  codeQuality: number;
  readabilityScore: number;
  complexityAnalysis: {
    time: string;
    space: string;
  };
  optimizationSuggestions: string[];
  bestPractices: string[];
  styleIssues: string[];
}

export type Language = 'c' | 'cpp' | 'python' | 'java';

export interface LanguageConfig {
  name: string;
  extension: string;
  monacoLanguage: string;
  template: string;
  compileCommand?: string;
  runCommand: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  totalContests: number;
  recentActivity: ActivityItem[];
  languageStats: LanguageStats[];
  submissionTrends: SubmissionTrend[];
}

export interface ActivityItem {
  id: string;
  type: 'submission' | 'problem' | 'user' | 'contest';
  description: string;
  timestamp: Date;
  userId?: string;
  username?: string;
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
}

export interface SubmissionTrend {
  date: string;
  submissions: number;
  accepted: number;
}

export interface CodeExecution {
  id: string;
  code: string;
  language: Language;
  input: string;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  timestamp: Date;
  aiReview?: AIReview;
}