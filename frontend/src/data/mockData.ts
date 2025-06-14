import { Problem, Submission, Contest, User, AIReview } from '../types';

export const mockProblems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Constraints
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- Only one valid answer exists.`,
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    timeLimit: 1,
    memoryLimit: 256,
    testCases: [
      { id: '1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { id: '2', input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { id: '3', input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
    ],
    submissions: 1234,
    acceptanceRate: 52.1,
    author: 'admin',
    createdAt: new Date('2024-01-01'),
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ]
  },
  {
    id: '2',
    title: 'Binary Tree Maximum Path Sum',
    description: `A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return the **maximum path sum** of any **non-empty** path.

## Constraints
- The number of nodes in the tree is in the range [1, 3 * 10⁴].
- -1000 ≤ Node.val ≤ 1000`,
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Tree', 'Depth-First Search', 'Binary Tree'],
    timeLimit: 2,
    memoryLimit: 512,
    testCases: [
      { id: '1', input: '[1,2,3]', expectedOutput: '6', isHidden: false },
      { id: '2', input: '[-10,9,20,null,null,15,7]', expectedOutput: '42', isHidden: false },
    ],
    submissions: 567,
    acceptanceRate: 38.7,
    author: 'admin',
    createdAt: new Date('2024-01-02'),
    examples: [
      {
        input: 'root = [1,2,3]',
        output: '6',
        explanation: 'The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.'
      }
    ]
  },
  {
    id: '3',
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Constraints
- 1 ≤ s.length ≤ 10⁴
- s consists of parentheses only '()[]{}'.`,
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    timeLimit: 1,
    memoryLimit: 256,
    testCases: [
      { id: '1', input: '()', expectedOutput: 'true', isHidden: false },
      { id: '2', input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { id: '3', input: '(]', expectedOutput: 'false', isHidden: true },
    ],
    submissions: 2156,
    acceptanceRate: 67.3,
    author: 'admin',
    createdAt: new Date('2024-01-03'),
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ]
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    userId: '1',
    problemId: '1',
    language: 'python',
    code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    status: 'Accepted',
    executionTime: 45,
    memoryUsage: 15.2,
    passedTests: 3,
    totalTests: 3,
    submittedAt: new Date('2024-01-15T10:30:00'),
    aiReview: {
      codeQuality: 8,
      optimizationSuggestions: [
        'Consider adding input validation',
        'The solution is already optimal O(n) time complexity'
      ],
      complexityAnalysis: {
        time: 'O(n)',
        space: 'O(n)'
      },
      styleIssues: [],
      plagiarismScore: 15
    }
  },
  {
    id: '2',
    userId: '1',
    problemId: '2',
    language: 'cpp',
    code: `class Solution {
public:
    int maxPathSum(TreeNode* root) {
        int maxSum = INT_MIN;
        helper(root, maxSum);
        return maxSum;
    }
private:
    int helper(TreeNode* node, int& maxSum) {
        if (!node) return 0;
        int left = max(0, helper(node->left, maxSum));
        int right = max(0, helper(node->right, maxSum));
        maxSum = max(maxSum, node->val + left + right);
        return node->val + max(left, right);
    }
};`,
    status: 'Wrong Answer',
    executionTime: 12,
    memoryUsage: 32.1,
    passedTests: 1,
    totalTests: 2,
    submittedAt: new Date('2024-01-15T11:15:00'),
    aiReview: {
      codeQuality: 7,
      optimizationSuggestions: [
        'Handle edge cases more carefully',
        'Consider the tree structure in your logic'
      ],
      complexityAnalysis: {
        time: 'O(n)',
        space: 'O(h)'
      },
      styleIssues: ['Missing comments for complex logic'],
      plagiarismScore: 8
    }
  }
];

export const mockContests: Contest[] = [
  {
    id: '1',
    title: 'Weekly Contest 384',
    description: 'Join our weekly programming contest featuring 4 challenging problems!',
    startTime: new Date('2024-01-20T14:00:00'),
    endTime: new Date('2024-01-20T16:30:00'),
    problems: ['1', '2', '3'],
    participants: 1247,
    status: 'Ended',
    type: 'Individual',
    leaderboard: [
      {
        userId: '1',
        username: 'coder_master',
        score: 3250,
        problemsSolved: 3,
        penalty: 45,
        lastSubmission: new Date('2024-01-20T15:30:00')
      },
      {
        userId: '2',
        username: 'algo_ninja',
        score: 2890,
        problemsSolved: 3,
        penalty: 67,
        lastSubmission: new Date('2024-01-20T15:45:00')
      }
    ]
  },
  {
    id: '2',
    title: 'Beginner Friendly Contest',
    description: 'Perfect for newcomers to competitive programming!',
    startTime: new Date('2024-01-25T10:00:00'),
    endTime: new Date('2024-01-25T12:00:00'),
    problems: ['1', '3'],
    participants: 0,
    status: 'Upcoming',
    type: 'Individual',
    leaderboard: []
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'user123',
    email: 'user@example.com',
    role: 'user',
    rating: 1456,
    solvedProblems: 42,
    submissions: 128,
    joinedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@judge.com',
    role: 'admin',
    rating: 2134,
    solvedProblems: 156,
    submissions: 234,
    joinedAt: new Date('2022-06-01')
  }
];