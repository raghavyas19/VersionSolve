const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { v4: uuid } = require('uuid');
const Problem = require('../models/Problem');

const codesDir = path.join(__dirname, '..', 'compiler', 'codes');
const inputsDir = path.join(__dirname, '..', 'compiler', 'inputs');
const outputsDir = path.join(__dirname, '..', 'compiler', 'outputs');

const codesDirOnline = path.join(codesDir, 'online');
const codesDirProblem = path.join(codesDir, 'problem');
const inputsDirOnline = path.join(inputsDir, 'online');
const inputsDirProblem = path.join(inputsDir, 'problem');
const outputsDirOnline = path.join(outputsDir, 'online');
const outputsDirProblem = path.join(outputsDir, 'problem');

[codesDirOnline, codesDirProblem, inputsDirOnline, inputsDirProblem, outputsDirOnline, outputsDirProblem].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const getDirs = (type) => {
  if (type === 'problem') {
    return { codes: codesDirProblem, inputs: inputsDirProblem, outputs: outputsDirProblem };
  }
  return { codes: codesDirOnline, inputs: inputsDirOnline, outputs: outputsDirOnline };
};

const extractJavaClassName = (code) => {
  const match = code.match(/(?:public\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  return match ? match[1] : null;
};

const generateFile = (format, content, filename = null, type = 'online') => {
  const { codes } = getDirs(type);
  const jobId = filename || uuid();
  const filePath = path.join(codes, `${jobId}.${format}`);
  fs.writeFileSync(filePath, content);
  return { filePath, jobId };
};

const generateInputFile = (input, type = 'online') => {
  if (!input) return null;
  const { inputs } = getDirs(type);
  const jobId = uuid();
  const filename = `${jobId}.txt`;
  const filePath = path.join(inputs, filename);
  fs.writeFileSync(filePath, input);
  return filePath;
};

const executeCode = (language, codeFilePath, inputFilePath, jobId, className = null, type = 'online') => {
  const { outputs, codes } = getDirs(type);
  const outPath = path.join(outputs, `${jobId}.out`);
  const outputFile = path.join(outputs, `${jobId}.txt`);
  const errorPath = path.join(outputs, `error-${jobId}.txt`);

  let command;

  if (language === 'python') {
    command = `python3 "${codeFilePath}" ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2> "${errorPath}"`;
  } else if (language === 'java') {
    command = `javac "${codeFilePath}" 2>> "${errorPath}" && java -cp "${codes}" ${className} ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2>> "${errorPath}"`;
  } else if (language === 'cpp') {
    command = `g++ "${codeFilePath}" -o "${outPath}" 2>> "${errorPath}" && "${outPath}" ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2>> "${errorPath}"`;
  } else if (language === 'c') {
    command = `gcc "${codeFilePath}" -o "${outPath}" 2>> "${errorPath}" && "${outPath}" ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2>> "${errorPath}"`;
  }

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      let errorOutput = null;
      if (fs.existsSync(errorPath)) {
        errorOutput = fs.readFileSync(errorPath, 'utf8');
        fs.unlinkSync(errorPath);
      }
      if (error) {
        return reject(errorOutput || stderr || error.message);
      }
      const output = fs.existsSync(outputFile)
        ? fs.readFileSync(outputFile, 'utf8')
        : stdout;
      resolve({ output, error: null });
    });
  });
};

exports.submitCode = async (req, res) => {
  try {
    const { code, language, input } = req.body || {};
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    let className = null;
    if (language === 'java') {
      className = extractJavaClassName(code);
      if (!className) {
        return res.status(400).json({ error: 'Could not determine Java class name from code.' });
      }
    }

    const { filePath: codeFilePath, jobId } = generateFile(language, code, language === 'java' ? className : null, 'online');
    const inputFilePath = generateInputFile(input, 'online');

    const startTime = Date.now();
    const { output, error } = await executeCode(language, codeFilePath, inputFilePath, jobId, className, 'online');
    const executionTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    // Cleanup
    const filesToDelete = [
      codeFilePath,
      inputFilePath,
      path.join(outputsDirOnline, `${jobId}.txt`),
      path.join(outputsDirOnline, `error-${jobId}.txt`),
      path.join(outputsDirOnline, `${jobId}.out`)
    ].filter(fs.existsSync);
    // filesToDelete.forEach(file => fs.unlinkSync(file));

    res.status(200).json({
      result: output || '',
      status: error ? 'Execution failed' : 'Execution completed',
      compileError: error || null,
      runtimeError: null,
      executionTime,
      memoryUsage
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() || 'Unknown error' });
  }
};

exports.executeProblemCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    if (!code || !language || !problemId) {
      return res.status(400).json({ error: 'Code, language, and problemId are required' });
    }
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const testCases = problem.testCases || [];
    let passedTests = 0;
    const results = [];
    for (const testCase of testCases) {
      try {
        let className = null;
        if (language === 'java') {
          className = extractJavaClassName(code);
          if (!className) throw new Error('Could not determine Java class name from code.');
        }
        const { filePath: codeFilePath, jobId } = generateFile(language, code, language === 'java' ? className : null, 'problem');
        const inputFilePath = generateInputFile(testCase.input, 'problem');
        const { output, error } = await executeCode(language, codeFilePath, inputFilePath, jobId, className, 'problem');
        const success = !error && output.trim() === testCase.expectedOutput.trim();
        if (success) passedTests++;
        results.push({
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          output,
          success,
          error: error || null
        });
      } catch (err) {
        results.push({
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          output: '',
          success: false,
          error: err.message || 'Execution error'
        });
      }
    }
    res.status(200).json({
      results,
      passedTests,
      totalTests: testCases.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.executeCustomCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    let className = null;
    if (language === 'java') {
      className = extractJavaClassName(code);
      if (!className) {
        return res.status(400).json({ error: 'Could not determine Java class name from code.' });
      }
    }

    const { filePath: codeFilePath, jobId } = generateFile(language, code, language === 'java' ? className : null, 'online');
    const inputFilePath = generateInputFile(input, 'online');

    const startTime = Date.now();
    const { output, error } = await executeCode(language, codeFilePath, inputFilePath, jobId, className, 'online');
    const executionTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    // Return result in the format expected by frontend
    const result = {
      testCaseId: 'custom',
      input: input || '',
      expectedOutput: '',
      output: output || '',
      success: !error,
      executionTime,
      memoryUsage,
      error: error || null
    };

    res.status(200).json({
      results: [result],
      passedTests: !error ? 1 : 0,
      totalTests: 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
