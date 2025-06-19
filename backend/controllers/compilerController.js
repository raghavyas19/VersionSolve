const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { v4: uuid } = require('uuid');

const codesDir = path.join(__dirname, '..', 'compiler', 'codes');
const inputsDir = path.join(__dirname, '..', 'compiler', 'inputs');
const outputsDir = path.join(__dirname, '..', 'compiler', 'outputs');

if (!fs.existsSync(codesDir)) fs.mkdirSync(codesDir, { recursive: true });
if (!fs.existsSync(inputsDir)) fs.mkdirSync(inputsDir, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

const extractJavaClassName = (code) => {
  const match = code.match(/(?:public\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  return match ? match[1] : null;
};

const generateFile = (format, content, filename = null) => {
  const jobId = filename || uuid();
  const filePath = path.join(codesDir, `${jobId}.${format}`);
  fs.writeFileSync(filePath, content);
  return { filePath, jobId };
};

const generateInputFile = (input) => {
  if (!input) return null;
  const jobId = uuid();
  const filename = `${jobId}.txt`;
  const filePath = path.join(inputsDir, filename);
  fs.writeFileSync(filePath, input);
  return filePath;
};

const executeCode = (language, codeFilePath, inputFilePath, jobId, className = null) => {
  const outPath = path.join(outputsDir, `${jobId}.out`);
  const outputFile = path.join(outputsDir, `${jobId}.txt`);
  const errorPath = path.join(outputsDir, 'error.txt');

  let command;

  if (language === 'python') {
    command = `python3 "${codeFilePath}" ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2> "${errorPath}"`;
  } else if (language === 'java') {
    command = `javac "${codeFilePath}" 2>> "${errorPath}" && java -cp "${codesDir}" ${className} ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2>> "${errorPath}"`;
  } else if (language === 'cpp') {
    command = `g++ "${codeFilePath}" -o "${outPath}" 2>> "${errorPath}" && "${outPath}" ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2>> "${errorPath}"`;
  } else if (language === 'c') {
    command = `gcc "${codeFilePath}" -o "${outPath}" 2>> "${errorPath}" && "${outPath}" ${inputFilePath ? `< "${inputFilePath}"` : ''} > "${outputFile}" 2>> "${errorPath}"`;
  }

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const errorOutput = fs.existsSync(errorPath)
          ? fs.readFileSync(errorPath, 'utf8')
          : stderr || error.message;
        return reject(errorOutput);
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

    const { filePath: codeFilePath, jobId } = generateFile(language, code, language === 'java' ? className : null);
    const inputFilePath = generateInputFile(input);

    const startTime = Date.now();
    const { output, error } = await executeCode(language, codeFilePath, inputFilePath, jobId, className);
    const executionTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    // Cleanup
    const filesToDelete = [
      codeFilePath,
      inputFilePath,
      path.join(outputsDir, `${jobId}.txt`),
      path.join(outputsDir, 'error.txt'),
      path.join(outputsDir, `${jobId}.out`)
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
