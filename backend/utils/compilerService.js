const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { v4: uuid } = require('uuid');

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

  ensureDirectories() {
    Object.values(this.dirs).forEach(dirGroup => {
      Object.values(dirGroup).forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
    });
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

  generateFile(language, content, filename = null, type = 'online') {
    const { codes } = this.getDirectories(type);
    const jobId = filename || uuid();
    const filePath = path.join(codes, `${jobId}.${this.getFileExtension(language)}`);
    fs.writeFileSync(filePath, content);
    return { filePath, jobId };
  }

  generateInputFile(input, type = 'online') {
    if (!input) return null;
    const { inputs } = this.getDirectories(type);
    const jobId = uuid();
    const filename = `${jobId}.txt`;
    const filePath = path.join(inputs, filename);
    fs.writeFileSync(filePath, input);
    return filePath;
  }

  getFileExtension(language) {
    const extensions = {
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      javascript: 'js'
    };
    return extensions[language] || 'txt';
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

  async executeCode(language, codeFilePath, inputFilePath, jobId, className = null, type = 'online') {
    const { outputs } = this.getDirectories(type);
    const outputFile = path.join(outputs, `${jobId}.txt`);
    const errorPath = path.join(outputs, `error-${jobId}.txt`);

    const command = this.buildCommand(language, codeFilePath, inputFilePath, jobId, className, type);

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
  }

  async executeSingleCode(code, language, input = null, type = 'online') {
    let className = null;
    if (language === 'java') {
      className = this.extractJavaClassName(code);
      if (!className) {
        throw new Error('Could not determine Java class name from code.');
      }
    }

    const { filePath: codeFilePath, jobId } = this.generateFile(
      language, 
      code, 
      language === 'java' ? className : null, 
      type
    );
    
    const inputFilePath = this.generateInputFile(input, type);

    const startTime = Date.now();
    const { output, error } = await this.executeCode(language, codeFilePath, inputFilePath, jobId, className, type);
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

  async executeWithTestCases(code, language, testCases, type = 'problem') {
    let passedTests = 0;
    const results = [];

    for (const testCase of testCases) {
      try {
        const { output, error } = await this.executeSingleCode(code, language, testCase.input, type);
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

    return {
      results,
      passedTests,
      totalTests: testCases.length
    };
  }
}

module.exports = new CompilerService(); 