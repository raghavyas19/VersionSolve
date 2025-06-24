import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save, Terminal, CheckCircle2, XCircle, Clock, MemoryStick, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Problem, Language, ExecutionResult } from '../../types';
import { LANGUAGES, DIFFICULTY_COLORS } from '../../utils/constants';
import { compileCode, runTestCases } from '../../utils/codeExecution';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebarVisibility, useEditorVisibility } from '../common/Layout';
import { useParams } from 'react-router-dom';
import { fetchProblemById } from '../../utils/api';
import { Users } from 'lucide-react';
import Split from 'react-split';

// Slim top navbar for code editor page
function SlimTopNavbar({ user, theme, toggleTheme }: { user: any, theme: string, toggleTheme: () => void }) {
  return (
    <div
      className={
        "flex items-center justify-between px-3 py-1 border-b " +
        (theme === 'dark'
          ? 'bg-gray-900 border-gray-100'
          : 'bg-blue-100 border-blue-200')
      }
      style={{ minHeight: 36, height: 36 }}
    >
      <img src="/Favicon.png" alt="Favicon" className="w-7 h-7" />
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-gray-700" />}
        </button>
        <span className="font-medium text-gray-900 dark:text-white text-xs">{user?.name || user?.username || 'User'}</span>
        <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
      </div>
    </div>
  );
}

const MIN_TERMINAL_PX = 40;
const MAX_TERMINAL_HEIGHT = 400; // Maximum terminal height in pixels
const TOP_NAVBAR_HEIGHT = 36; // Height of the slim top navbar
const EDITOR_NAVBAR_HEIGHT = 44; // Height of the editor navbar
const MIN_PANEL_PERCENT = 30;
const MAX_PANEL_PERCENT = 65;

const ProblemCodeEditor: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<ExecutionResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [activeTab, setActiveTab] = useState<'testcases' | 'result' | 'custom'>('testcases');
  const editorRef = useRef<any>(null);
  const { setHidden } = useSidebarVisibility();
  const { setEditorOpen } = useEditorVisibility();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [splitSize, setSplitSize] = useState(480);
  const [terminalHeight, setTerminalHeight] = useState(220);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);

  useEffect(() => {
    setHidden(true);
    setEditorOpen(true);
    return () => {
      setHidden(false);
      setEditorOpen(false);
    };
  }, [setHidden, setEditorOpen]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (problemId) {
          const data = await fetchProblemById(problemId);
          setProblem(data);
          setCode(LANGUAGES[selectedLanguage].template);
        }
      } catch (err: any) {
        setError('Problem not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    // eslint-disable-next-line
  }, [problemId, selectedLanguage]);

  // User-specific localStorage key
  const getStorageKey = () => {
    return `code_${user?.id || 'guest'}_${problemId}_${selectedLanguage}`;
  };

  // Load code from localStorage on mount/user/problem/language change
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      setCode(saved);
    } else if (problem) {
      setCode(LANGUAGES[selectedLanguage].template);
    }
    // eslint-disable-next-line
  }, [user?.id, problemId, selectedLanguage, problem]);

  // Save code to localStorage on change
  useEffect(() => {
    if (problem) {
      localStorage.setItem(getStorageKey(), code);
    }
    // eslint-disable-next-line
  }, [code, user?.id, problemId, selectedLanguage, problem]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setCode(LANGUAGES[language].template);
  };

  const handleRunCode = async () => {
    if (!code.trim() || !problem) return;
    setIsRunning(true);
    setActiveTab('result');
    try {
      const compileResult = await compileCode(code, selectedLanguage);
      if (!compileResult.success) {
        setTestResults([]);
        return;
      }
      const results = await runTestCases(code, selectedLanguage, problem.testCases);
      setTestResults(results);
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCustomRun = async () => {
    if (!code.trim() || !customInput.trim() || !problem) return;
    setIsRunning(true);
    try {
      const compileResult = await compileCode(code, selectedLanguage);
      if (!compileResult.success) {
        setCustomOutput(`Compilation Error: ${compileResult.error}`);
        return;
      }
      const result = await runTestCases(code, selectedLanguage, [{
        id: 'custom',
        input: customInput,
        expectedOutput: '',
        isHidden: false
      }]);
      if (result[0]) {
        setCustomOutput(result[0].output || result[0].error || 'No output');
      }
    } catch (error) {
      setCustomOutput('Runtime Error: ' + error);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  }
  if (error || !problem) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error || 'Problem not found'}</div>;
  }

  const passedTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;

  // Custom gutter for Split
  const gutter = (index: number, direction: 'horizontal' | 'vertical') => {
    const gutterElement = document.createElement('div');
    gutterElement.className = `split-gutter split-gutter-${direction}`;
    return gutterElement;
  };

  // Gutter style for smooth resizing
  const gutterStyle = (dimension: string, gutterSize: number) => ({
    [dimension]: `${gutterSize}px`,
    background: '#e5e7eb',
    transition: 'background 0.3s ease',
  });

  // Element style to ensure proper sizing
  const elementStyle = (dimension: string, elementSize: number, gutterSize: number, index: number) => ({
    [dimension]: `calc(${elementSize}% - ${gutterSize / 2}px)`,
    transition: 'none', // Prevent layout jitter during drag
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SlimTopNavbar user={user} theme={theme} toggleTheme={toggleTheme} />
      <div className="flex-1 min-h-0">
        <Split
          direction="horizontal"
          sizes={leftCollapsed ? [0, 100] : [(splitSize / window.innerWidth) * 100, 100 - (splitSize / window.innerWidth) * 100]}
          minSize={[
            window.innerWidth * (MIN_PANEL_PERCENT / 100),
            window.innerWidth * (MIN_PANEL_PERCENT / 100)
          ]}
          maxSize={[
            window.innerWidth * (MAX_PANEL_PERCENT / 100),
            window.innerWidth * (MAX_PANEL_PERCENT / 100)
          ]}
          gutterSize={6}
          gutterAlign="center"
          snapOffset={10}
          dragInterval={1}
          cursor="col-resize"
          gutter={gutter}
          gutterStyle={gutterStyle}
          elementStyle={elementStyle}
          className="flex h-full"
          style={{ border: 'none' }}
          onDrag={([size]) => {
            const px = Math.max(
              window.innerWidth * (MIN_PANEL_PERCENT / 100),
              Math.min((size / 100) * window.innerWidth, window.innerWidth * (MAX_PANEL_PERCENT / 100))
            );
            setSplitSize(px);
          }}
          onDragEnd={([size]) => {
            const px = Math.max(
              window.innerWidth * (MIN_PANEL_PERCENT / 100),
              Math.min((size / 100) * window.innerWidth, window.innerWidth * (MAX_PANEL_PERCENT / 100))
            );
            setSplitSize(px);
            setLeftCollapsed(px <= window.innerWidth * (MIN_PANEL_PERCENT / 100));
          }}
        >
          {/* Left: Problem Details */}
          <div className={clsx('h-full overflow-y-auto border-r border-gray-200 dark:border-gray-900 transition-all', theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200', leftCollapsed ? 'hidden' : '')}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold text-lg text-gray-900 dark:text-white truncate">{problem.title}</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                  DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]
                )}>{problem.difficulty}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Acceptance: {problem.acceptanceRate}%</span>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br>') }} />
              </div>
              {problem.examples.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-2">Examples</h3>
                  {problem.examples.map((example: any, index: number) => (
                    <div key={index} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="mb-1"><strong>Input:</strong> <pre className="inline whitespace-pre-wrap">{example.input}</pre></div>
                      <div className="mb-1"><strong>Output:</strong> <pre className="inline whitespace-pre-wrap">{example.output}</pre></div>
                      {example.explanation && <div><strong>Explanation:</strong> <span>{example.explanation}</span></div>}
                    </div>
                  ))}
                  <hr className="my-4 border-gray-400 dark:border-gray-700" />
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold mb-2">Constraints</h3>
                <div className="space-y-1 text-sm">
                  <div><Clock className="inline h-4 w-4 mr-1 text-gray-500" />Time Limit: {problem.timeLimit}s</div>
                  <div><MemoryStick className="inline h-4 w-4 mr-1 text-gray-500" />Memory: {problem.memoryLimit}MB</div>
                  <div><Users className="inline h-4 w-4 mr-1 text-gray-500" />{problem.submissions} submissions</div>
                </div>
                <hr className="my-4 border-gray-400 dark:border-gray-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">{tag}</span>
                  ))}
                </div>
                <hr className="my-4 border-gray-400 dark:border-gray-700" />
              </div>
            </div>
          </div>
          {/* Right: Code Editor + Output */}
          <div className={clsx('h-full flex flex-col relative overflow-hidden', theme === 'dark' ? 'bg-gray-900' : 'bg-[#fdf6f0]')}>
            {/* Editor Navbar */}
            <div className={clsx(
              'flex items-center px-4 py-2 border-b',
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-200 border-gray-300'
            )} style={{ minHeight: 44, height: 44 }}>
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ minWidth: 100 }}
                >
                  {['python', 'cpp', 'c', 'java'].map(key => (
                    <option key={key} value={key}>{LANGUAGES[key].name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isRunning ? <LoadingSpinner size="sm" /> : <Play className="h-4 w-4" />}
                  <span>Run</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                  <Save className="h-4 w-4" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
            {/* Editor and Output Split (vertical) */}
            <Split
              direction="vertical"
              sizes={bottomCollapsed ? [100, 0] : [100 - (terminalHeight / (window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT)) * 100, (terminalHeight / (window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT)) * 100]}
              minSize={[120, MIN_TERMINAL_PX]}
              maxSize={[Infinity, Math.min(MAX_TERMINAL_HEIGHT, window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT - 120)]}
              gutterSize={6}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              cursor="row-resize"
              gutter={gutter}
              gutterStyle={gutterStyle}
              elementStyle={elementStyle}
              className="flex-1 flex flex-col h-full overflow-hidden"
              style={{ border: 'none', height: '100%' }}
              onDrag={([_, outputSize]) => {
                const availableHeight = window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT;
                const newTerminalHeight = (outputSize / 100) * availableHeight;
                setTerminalHeight(Math.max(
                  MIN_TERMINAL_PX,
                  Math.min(
                    newTerminalHeight,
                    Math.min(MAX_TERMINAL_HEIGHT, availableHeight - 120)
                  )
                ));
              }}
              onDragEnd={([_, outputSize]) => {
                const availableHeight = window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT;
                const newTerminalHeight = (outputSize / 100) * availableHeight;
                if (outputSize < 5 || newTerminalHeight < MIN_TERMINAL_PX + 5) {
                  setBottomCollapsed(true);
                  setTerminalHeight(MIN_TERMINAL_PX);
                } else {
                  setBottomCollapsed(false);
                  setTerminalHeight(Math.max(
                    MIN_TERMINAL_PX,
                    Math.min(
                      newTerminalHeight,
                      Math.min(MAX_TERMINAL_HEIGHT, availableHeight - 120)
                    )
                  ));
                }
              }}
            >
              {/* Editor Section */}
              <div className="flex flex-col h-full">
                <Editor
                  height="100%"
                  defaultLanguage={selectedLanguage}
                  language={selectedLanguage}
                  value={code}
                  onChange={value => setCode(value || '')}
                  theme={theme === 'dark' ? 'custom-dark' : 'custom-light'}
                  options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    lineNumbersMinChars: 2,
                    lineDecorationsWidth: 2,
                    lineHeight: 26,
                    scrollBeyondLastLine: false,
                    padding: { top: 8, bottom: 8 },
                    renderLineHighlight: 'all',
                    scrollbar: { vertical: 'auto', horizontal: 'auto' },
                    overviewRulerLanes: 0,
                    smoothScrolling: true,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                  onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    if (monaco) {
                      monaco.editor.defineTheme('custom-light', {
                        base: 'vs',
                        inherit: true,
                        rules: [],
                        colors: {
                          'editor.background': '#f6f8fa',
                          'editor.lineHighlightBackground': '#e3eafc',
                          'editor.lineHighlightBorder': '#d0d7de',
                          'editor.lineBackground': '#f0f4fa', // Always visible row background
                        },
                      });
                      monaco.editor.defineTheme('custom-dark', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [],
                        colors: {
                          'editor.background': '#181a20',
                          'editor.lineHighlightBackground': '#23272f',
                          'editor.lineHighlightBorder': '#23272f',
                          'editor.lineBackground': '#20232a', // Always visible row background in dark
                        },
                      });
                      monaco.editor.setTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
                    }
                  }}
                />
              </div>
              {/* Terminal Section */}
              <div className={clsx('bg-white dark:bg-gray-800 border-t-2 border-gray-300 dark:border-[#222a35]', bottomCollapsed ? 'hidden' : '')} style={{ minHeight: MIN_TERMINAL_PX, maxHeight: Math.min(MAX_TERMINAL_HEIGHT, window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT - 60), height: '100%', overflow: 'auto' }}>
                <div className={clsx("flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600",
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200')}
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Result & Test Cases</span>
                  </div>
                  <button onClick={() => { setBottomCollapsed(true); setTerminalHeight(MIN_TERMINAL_PX); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="px-4 py-2">
                  <div className="flex gap-2 mb-2">
                    <button
                      className={clsx('px-3 py-1 rounded text-sm font-medium', activeTab === 'testcases' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200')}
                      onClick={() => setActiveTab('testcases')}
                    >
                      Test Cases
                    </button>
                    <button
                      className={clsx('px-3 py-1 rounded text-sm font-medium', activeTab === 'result' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200')}
                      onClick={() => setActiveTab('result')}
                    >
                      Results
                    </button>
                    <button
                      className={clsx('px-3 py-1 rounded text-sm font-medium', activeTab === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200')}
                      onClick={() => setActiveTab('custom')}
                    >
                      Custom Input
                    </button>
                  </div>
                  {activeTab === 'testcases' && problem && (
                    <div>
                      {problem.testCases.map((test, idx) => (
                        <div key={test.id} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-2 mb-1">
                            {test.isHidden ? <Clock className="h-4 w-4 text-yellow-400" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Test Case {idx + 1}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Input:</strong> <pre className="inline whitespace-pre-wrap">{test.input}</pre>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Expected Output:</strong> <pre className="inline whitespace-pre-wrap">{test.expectedOutput}</pre>
                          </div>
                          {testResults[idx] && (
                            <div className={clsx('mt-1 text-xs', testResults[idx].success ? 'text-green-600' : 'text-red-600')}>{testResults[idx].success ? 'Passed' : 'Failed'}</div>
                          )}
                        </div>
                      ))}
                      {totalTests > 0 && (
                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                          Passed {passedTests} / {totalTests} test cases
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'result' && (
                    <div>
                      {testResults.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400">No results yet. Run your code to see results.</div>
                      ) : (
                        testResults.map((result, idx) => (
                          <div key={idx} className={clsx('mb-2 p-2 rounded', result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                            {result.success ? 'Passed' : 'Failed'}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {activeTab === 'custom' && (
                    <div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="w-full h-20 rounded p-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        placeholder="Enter custom input"
                      />
                      {/* <button
                        onClick={handleCustomRun}
                        disabled={isRunning}
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {isRunning ? <LoadingSpinner size="sm" /> : 'Run'}
                      </button> */}
                      {customOutput && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg dark:bg-gray-800">
                          <strong>Output:</strong>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{customOutput}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Split>
            {/* Sticky terminal header when collapsed */}
            {bottomCollapsed && (
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 py-2 px-4 flex items-center justify-between cursor-pointer" onClick={() => { setBottomCollapsed(false); setTerminalHeight(220); }}>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Result & Test Cases</span>
                </div>
              </div>
            )}
          </div>
        </Split>
      </div>
      {/* Custom split gutter styles */}
      <style>
        {`
          /* Custom split gutter: two dark lines with transparent center */
          .split-gutter {
            background: transparent !important;
            position: relative;
          }
          .split-gutter-horizontal {
            width: 8px !important;
            cursor: col-resize;
          }
          .split-gutter-vertical {
            height: 8px !important;
            cursor: row-resize;
          }
          .split-gutter::before, .split-gutter::after {
            content: '';
            position: absolute;
            background: #000;
            opacity: 0.18;
            border-radius: 1px;
          }
          .split-gutter-horizontal::before, .split-gutter-horizontal::after {
            top: 0;
            bottom: 0;
            width: 2px;
          }
          .split-gutter-horizontal::before {
            left: 2px;
          }
          .split-gutter-horizontal::after {
            right: 2px;
          }
          .split-gutter-vertical::before, .split-gutter-vertical::after {
            left: 0;
            right: 0;
            height: 2px;
          }
          .split-gutter-vertical::before {
            top: 2px;
          }
          .split-gutter-vertical::after {
            bottom: 2px;
          }
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .split-gutter::before, .split-gutter::after {
              background: #fff;
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProblemCodeEditor;