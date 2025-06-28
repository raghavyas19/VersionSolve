import { CompilerOutput, ExecutionResult, TestCase, Language, AIReview } from '../types';
import { LANGUAGES } from './constants';

export const compileCode = async (code: string, language: Language): Promise<CompilerOutput> => {
  // Simulate compilation process
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Mock compilation - in a real system, this would call your backend
  const hasCompilationError = code.includes('syntax_error') || code.includes('undefined_variable');
  
  if (hasCompilationError) {
    return {
      success: false,
      error: 'Compilation failed: syntax error on line 5',
      executionTime: 0,
      memoryUsage: 0,
      exitCode: 1
    };
  }

  return {
    success: true,
    executionTime: Math.floor(Math.random() * 100) + 50,
    memoryUsage: Math.floor(Math.random() * 50) + 10,
    exitCode: 0
  };
};

export const executeCode = async (
  code: string, 
  language: Language, 
  input: string
): Promise<CompilerOutput> => {
  // Simulate code execution
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Mock execution - in a real system, this would run in a sandboxed environment
  const hasRuntimeError = code.includes('runtime_error') || code.includes('division_by_zero');
  const hasInfiniteLoop = code.includes('while(true)') || code.includes('infinite_loop');
  
  if (hasRuntimeError) {
    return {
      success: false,
      error: 'Runtime Error: division by zero',
      executionTime: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 30) + 5,
      exitCode: 1
    };
  }
  
  if (hasInfiniteLoop) {
    return {
      success: false,
      error: 'Time Limit Exceeded',
      executionTime: 2000, // Exceeds typical time limit
      memoryUsage: Math.floor(Math.random() * 100) + 50,
      exitCode: 124
    };
  }

  // Generate mock output based on input
  let output = '';
  if (input.includes('[2,7,11,15]') && input.includes('9')) {
    output = '[0,1]';
  } else if (input.includes('()')) {
    output = 'true';
  } else if (input.includes('[1,2,3]')) {
    output = '6';
  } else if (input.trim()) {
    // Simple echo for demonstration
    const lines = input.trim().split('\n');
    if (lines.length === 1 && !isNaN(Number(lines[0]))) {
      // If it's a single number, return its square
      output = String(Math.pow(Number(lines[0]), 2));
    } else {
      // Echo the input with some processing
      output = lines.map(line => `Processed: ${line}`).join('\n');
    }
  } else {
    output = 'Hello, World!';
  }

  return {
    success: true,
    output,
    executionTime: Math.floor(Math.random() * 200) + 10,
    memoryUsage: Math.floor(Math.random() * 50) + 10,
    exitCode: 0
  };
};

export const executeCodeWithInput = async (
  code: string,
  language: Language,
  input: string
): Promise<ExecutionResult> => {
  const compileResult = await compileCode(code, language);
  
  if (!compileResult.success) {
    return {
      output: '',
      success: false,
      executionTime: compileResult.executionTime,
      memoryUsage: compileResult.memoryUsage,
      error: compileResult.error,
      input,
      expectedOutput: ''
    };
  }

  const executeResult = await executeCode(code, language, input);
  
  return {
    output: executeResult.output || '',
    success: executeResult.success,
    executionTime: executeResult.executionTime,
    memoryUsage: executeResult.memoryUsage,
    error: executeResult.error,
    input,
    expectedOutput: ''
  };
};

export const runTestCases = async (
  code: string,
  language: Language,
  problemId: string
): Promise<{ results: ExecutionResult[]; passedTests: number; totalTests: number }> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problem/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, language, problemId }),
  });
  if (!response.ok) throw new Error('Code execution failed');
  return response.json();
};

export const submitSolution = async (submissionData: any) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission`, {
    method: 'POST',
    headers,
    body: JSON.stringify(submissionData),
  });
  if (!response.ok) throw new Error('Submission failed');
  return response.json();
};

export const generateAIReview = async (code: string, language: Language): Promise<AIReview> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error('AI review failed');
  const data = await response.json();
  // TODO: Parse/structure data.review as needed for your UI
  return {
    codeQuality: 7, // Placeholder, parse from data.review if structured
    readabilityScore: 8,
    complexityAnalysis: { time: "O(n)", space: "O(1)" },
    optimizationSuggestions: [],
    bestPractices: [],
    styleIssues: [],
    ...data.review // If your backend returns a structured object
  };
};

export const analyzeComplexity = (code: string): { time: string; space: string } => {
  // Simple heuristic analysis - in a real system, this would be more sophisticateddocker
  const hasNestedLoops = (code.match(/for|while/g) || []).length >= 2;
  const hasRecursion = code.includes('return') && (code.includes('(') && code.includes(')'));
  const hasHashMap = code.includes('map') || code.includes('dict') || code.includes('{}');
  
  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(1)';
  
  if (hasNestedLoops) {
    timeComplexity = 'O(n²)';
  } else if (hasRecursion) {
    timeComplexity = 'O(2^n)';
  }
  
  if (hasHashMap || hasRecursion) {
    spaceComplexity = 'O(n)';
  }
  
  return {
    time: timeComplexity,
    space: spaceComplexity
  };
};

export const executeCustomCode = async (
  code: string,
  language: Language,
  input: string
): Promise<{ results: ExecutionResult[]; passedTests: number; totalTests: number }> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problem/execute-custom`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, language, input }),
  });
  if (!response.ok) throw new Error('Code execution failed');
  return response.json();
};