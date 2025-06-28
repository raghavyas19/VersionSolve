const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const { v4: uuid } = require('uuid');
const util = require('util');
const execAsync = util.promisify(exec);

const SUPPORTED_LANGUAGES = ['python', 'java', 'cpp', 'c'];
const EXEC_TIMEOUT = 5000; // 5 seconds
const CONCURRENCY_LIMIT = 3;

class CompilerService {
  constructor() {
    this.baseDir = path.join(__dirname, '..', 'compiler');
    this.dirs = {
      codes: {
        online: path.join(this.baseDir, 'codes', 'online'),
        problem: path.join(this.baseDir, 'codes', 'problem')
      },
      inputs: {
        online: path.join(this.baseDir, 'inputs', 'online'),
        problem: path.join(this.baseDir, 'inputs', 'problem')
      },
      outputs: {
        online: path.join(this.baseDir, 'outputs', 'online'),
        problem: path.join(this.baseDir, 'outputs', 'problem')
      }
    };
    
    this.ensureDirectories();
  }

  async ensureDirectories() {
    for (const dirGroup of Object.values(this.dirs)) {
      for (const dir of Object.values(dirGroup)) {
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch {}
      }
    }
  }

  getDirectories(type = 'online') {
    return {
      codes: this.dirs.codes[type],
      inputs: this.dirs.inputs[type],
      outputs: this.dirs.outputs[type]
    };
  }

  extractJavaClassName(code) {
    const match = code.match(/(?:public\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/);
    return match ? match[1] : null;
  }

  getFileExtension(language) {
    const fileExtensions = {
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c'
    };
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error('Unsupported language');
    }
    return fileExtensions[language];
  }

  async generateFile(language, content, filename = null, type = 'online') {
    const { codes } = this.getDirectories(type);
    const jobId = filename || uuid();
    const filePath = path.join(codes, `${jobId}.${this.getFileExtension(language)}`);
    await fs.writeFile(filePath, content);
    return { filePath, jobId };
  }

  async generateInputFile(input, type = 'online') {
    if (!input) return null;
    const { inputs } = this.getDirectories(type);
    const jobId = uuid();
    const filename = `${jobId}.txt`;
    const filePath = path.join(inputs, filename);
    await fs.writeFile(filePath, input);
    return filePath;
  }

  buildCommand(language, codeFilePath, inputFilePath, jobId, className = null, type = 'online') {
    const { outputs, codes } = this.getDirectories(type);
    const outPath = path.join(outputs, `${jobId}.out`);
    const outputFile = path.join(outputs, `${jobId}.txt`);
    const errorPath = path.join(outputs, `error-${jobId}.txt`);
    const inputRedirect = inputFilePath ? `< "${inputFilePath}"` : '';
    const outputRedirect = `> "${outputFile}" 2> "${errorPath}"`;
    switch (language) {
      case 'python':
        return `python3 "${codeFilePath}" ${inputRedirect} ${outputRedirect}`;
      case 'java':
        return `javac "${codeFilePath}" 2>> "${errorPath}" && java -cp "${codes}" ${className} ${inputRedirect} ${outputRedirect}`;
      case 'cpp':
        return `g++ "${codeFilePath}" -o "${outPath}" 2>> "${errorPath}" && "${outPath}" ${inputRedirect} ${outputRedirect}`;
      case 'c':
        return `gcc "${codeFilePath}" -o "${outPath}" 2>> "${errorPath}" && "${outPath}" ${inputRedirect} ${outputRedirect}`;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async cleanupFiles(files) {
    for (const file of files) {
      if (file) {
        try { await fs.unlink(file); } catch {}
      }
    }
  }

  async executeCode(language, codeFilePath, inputFilePath, jobId, className = null, type = 'online', timeout = 5000) {
    const { outputs } = this.getDirectories(type);
    const outputFile = path.join(outputs, `${jobId}.txt`);
    const errorPath = path.join(outputs, `error-${jobId}.txt`);
    const command = this.buildCommand(language, codeFilePath, inputFilePath, jobId, className, type);
    try {
      const { stdout, stderr } = await execAsync(command, { timeout, maxBuffer: 1024 * 1024 });
      let output = '';
      try { output = await fs.readFile(outputFile, 'utf8'); } catch { output = stdout; }
      await this.cleanupFiles([outputFile, errorPath, codeFilePath, inputFilePath]);
      return { output, error: null };
    } catch (error) {
      let errorOutput = '';
      try { errorOutput = await fs.readFile(errorPath, 'utf8'); } catch {}
      await this.cleanupFiles([outputFile, errorPath, codeFilePath, inputFilePath]);
      return { output: '', error: error.killed ? 'Execution timed out' : (errorOutput || error.message) };
    }
  }

  async executeSingleCode(code, language, input = null, type = 'online', timeout = 5000) {
    let className = null;
    if (language === 'java') {
      className = this.extractJavaClassName(code);
      if (!className) {
        throw new Error('Could not determine Java class name from code.');
      }
    }
    const { filePath: codeFilePath, jobId } = await this.generateFile(
      language,
      code,
      language === 'java' ? className : null,
      type
    );
    const inputFilePath = await this.generateInputFile(input, type);
    const startTime = Date.now();
    const { output, error } = await this.executeCode(language, codeFilePath, inputFilePath, jobId, className, type, timeout);
    const executionTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    return {
      output,
      error,
      executionTime,
      memoryUsage,
      jobId
    };
  }

  async executeWithTestCases(code, language, testCases, type = 'problem', timeout = 5000) {
    const results = [];
    let passedTests = 0;
    let index = 0;
    let running = 0;
    const runNext = async () => {
      if (index >= testCases.length) return;
      const i = index++;
      running++;
      try {
        const { output, error } = await this.executeSingleCode(code, language, testCases[i].input, type, timeout);
        const success = !error && output.trim() === testCases[i].expectedOutput.trim();
        if (success) passedTests++;
        results[i] = {
          testCaseId: testCases[i].id,
          input: testCases[i].input,
          expectedOutput: testCases[i].expectedOutput,
          output,
          success,
          error: error || null
        };
      } catch (err) {
        results[i] = {
          testCaseId: testCases[i].id,
          input: testCases[i].input,
          expectedOutput: testCases[i].expectedOutput,
          output: '',
          success: false,
          error: err.message || 'Execution error'
        };
      } finally {
        running--;
        if (index < testCases.length) await runNext();
      }
    };
    const runners = Array(Math.min(CONCURRENCY_LIMIT, testCases.length)).fill(0).map(runNext);
    await Promise.all(runners);
    return {
      results,
      passedTests,
      totalTests: testCases.length
    };
  }
}

module.exports = new CompilerService(); 