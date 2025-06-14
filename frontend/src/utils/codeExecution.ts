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
  testCases: TestCase[]
): Promise<ExecutionResult[]> => {
  const results: ExecutionResult[] = [];
  
  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input);
    
    results.push({
      testCase,
      output: result.output || '',
      success: result.success && result.output?.trim() === testCase.expectedOutput.trim(),
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
      error: result.error
    });
  }
  
  return results;
};

export const generateAIReview = async (code: string, language: Language): Promise<AIReview> => {
  // Simulate AI analysis
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  // Mock AI review - in a real system, this would call an AI service
  const codeLength = code.length;
  const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
  const hasGoodNaming = !/[a-z][0-9]/.test(code) && !code.includes('temp') && !code.includes('var1');
  const hasNestedLoops = (code.match(/for|while/g) || []).length >= 2;
  const hasRecursion = code.includes('return') && code.includes('(') && code.includes(')');
  
  const codeQuality = Math.min(10, Math.max(1, 
    5 + 
    (hasComments ? 1 : 0) + 
    (hasGoodNaming ? 2 : 0) + 
    (codeLength > 50 ? 1 : 0) +
    (codeLength < 500 ? 1 : 0)
  ));
  
  const readabilityScore = Math.min(10, Math.max(1,
    6 + 
    (hasComments ? 2 : 0) + 
    (hasGoodNaming ? 2 : 0)
  ));

  const optimizationSuggestions = [];
  const bestPractices = [];
  const styleIssues = [];
  const securityIssues = [];

  if (!hasComments) {
    styleIssues.push('Consider adding comments to explain complex logic');
  }
  
  if (!hasGoodNaming) {
    styleIssues.push('Use more descriptive variable names');
  }
  
  if (hasNestedLoops) {
    optimizationSuggestions.push('Consider optimizing nested loops for better time complexity');
  }
  
  if (code.includes('eval') || code.includes('exec')) {
    securityIssues.push('Avoid using eval() or exec() functions for security reasons');
  }
  
  if (hasComments) {
    bestPractices.push('Good use of comments for code documentation');
  }
  
  if (hasGoodNaming) {
    bestPractices.push('Excellent variable naming conventions');
  }
  
  if (codeLength < 200) {
    bestPractices.push('Concise and clean implementation');
  }

  // Add some default suggestions if none were added
  if (optimizationSuggestions.length === 0) {
    optimizationSuggestions.push('Code appears to be well-optimized');
    optimizationSuggestions.push('Consider edge cases and input validation');
  }
  
  if (bestPractices.length === 0) {
    bestPractices.push('Code follows basic programming principles');
  }

  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(1)';
  
  if (hasNestedLoops) {
    timeComplexity = 'O(n²)';
  } else if (hasRecursion) {
    timeComplexity = 'O(2^n)';
    spaceComplexity = 'O(n)';
  }
  
  if (code.includes('map') || code.includes('dict') || code.includes('{}') || hasRecursion) {
    spaceComplexity = 'O(n)';
  }

  return {
    codeQuality,
    readabilityScore,
    optimizationSuggestions,
    complexityAnalysis: {
      time: timeComplexity,
      space: spaceComplexity
    },
    styleIssues,
    plagiarismScore: Math.floor(Math.random() * 20) + 5, // Low plagiarism score
    bestPractices,
    securityIssues
  };
};

export const analyzeComplexity = (code: string): { time: string; space: string } => {
  // Simple heuristic analysis - in a real system, this would be more sophisticated
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