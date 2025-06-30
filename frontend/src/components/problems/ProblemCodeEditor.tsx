import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save, Terminal, CheckCircle2, XCircle, Clock, MemoryStick, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Problem, Language, ExecutionResult } from '../../types';
import { LANGUAGES, DIFFICULTY_COLORS } from '../../utils/constants';
import { compileCode, runTestCases, submitSolution, executeCustomCode } from '../../utils/codeExecution';
import { useTheme } from '../../contexts/ThemeContext';
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
      <img src={`${import.meta.env.BASE_URL}Favicon.png`} alt="Favicon" className="w-7 h-7" />
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

  // Language preference storage key
  const getLanguagePreferenceKey = () => {
    return `language_preference_${user?.id || 'guest'}_${problemId}`;
  };

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [languageLoading, setLanguageLoading] = useState(true);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<ExecutionResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [activeTab, setActiveTab] = useState<'testcases' | 'result' | 'custom'>('testcases');
  const [passedTests, setPassedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const editorRef = useRef<any>(null);
  const { setHidden } = useSidebarVisibility();
  const { setEditorOpen } = useEditorVisibility();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [splitSize, setSplitSize] = useState(480);
  const prevTerminalHeight = useRef(220);
  const [terminalHeight, setTerminalHeight] = useState(220);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionVerdict, setSubmissionVerdict] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [isCustomRunning, setIsCustomRunning] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [popupProgress, setPopupProgress] = useState(100);

  useEffect(() => {
    setHidden(true);
    setEditorOpen(true);
    return () => {
      setHidden(false);
      setEditorOpen(false);
    };
  }, [setHidden, setEditorOpen]);

  useEffect(() => {
    if (!selectedLanguage) return;
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (problemId && selectedLanguage) {
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
    if (!selectedLanguage) return;
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      setCode(saved);
    } else if (problem && selectedLanguage) {
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

  // Update passedTests and totalTests when testResults change
  useEffect(() => {
    const passed = testResults.filter(r => r.success).length;
    const total = testResults.length;
    setPassedTests(passed);
    setTotalTests(total);
  }, [testResults]);

  // Set selectedLanguage from localStorage after user and problemId are available
  useEffect(() => {
    if (user && user.id && problemId) {
      const saved = localStorage.getItem(`language_preference_${user.id}_${problemId}`);
      if (saved && ['c', 'cpp', 'java', 'python'].includes(saved)) {
        setSelectedLanguage(saved as Language);
      } else {
        setSelectedLanguage('python');
      }
      setLanguageLoading(false);
    }
  }, [user, problemId]);

  const handleLanguageChange = (language: Language) => {
    if (!language) return;
    setSelectedLanguage(language);
    setCode(LANGUAGES[language].template);
    // Save language preference
    if (user && user.id && problemId) {
      localStorage.setItem(`language_preference_${user.id}_${problemId}`, language);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupProgress(100);
    setShowPopup(true);
    
    // Animate progress bar
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms for smooth animation
    const steps = duration / interval;
    const decrement = 100 / steps;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      const remaining = Math.max(0, 100 - (currentStep * decrement));
      setPopupProgress(remaining);
      
      if (currentStep >= steps || remaining <= 0) {
        clearInterval(progressInterval);
        setShowPopup(false);
      }
    }, interval);
  };

  const handleRunCode = async () => {
    if (!code.trim() || !problem) return;
    setIsRunning(true);
    setActiveTab('testcases');
    setTerminalError(null); // Clear previous error
    try {
      const { results } = await runTestCases(code, selectedLanguage!, problemId!);
      setTestResults(results);
      // If all test cases have the same error, show it globally
      if (
        results.length > 0 &&
        results.every(r => r.error && r.error === results[0].error)
      ) {
        setTerminalError(results[0].error || 'Unknown error');
      } else {
        setTerminalError(null);
      }
    } catch (error: any) {
      setTerminalError(error?.message || String(error));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !problem || !user) return;
    setIsSubmitting(true);
    setSubmissionVerdict(null);
    setActiveTab('testcases');
    try {
      // First, run test cases to check if all pass
      const { results, passedTests, totalTests } = await runTestCases(code, selectedLanguage!, problemId!);
      setTestResults(results);
      
      // Check if all test cases passed
      if (passedTests !== totalTests) {
        // Determine why tests failed
        let failureReason = 'Wrong Answer';
        if (results.some(r => r.error && r.error.toLowerCase().includes('compil'))) {
          failureReason = 'Compilation Error';
        } else if (results.some(r => r.error && r.error.toLowerCase().includes('runtime'))) {
          failureReason = 'Runtime Error';
        } else if (results.some(r => r.error && r.error.toLowerCase().includes('time limit'))) {
          failureReason = 'Time Limit Exceeded';
        }
        
        setSubmissionVerdict(`${failureReason} - ${passedTests}/${totalTests} tests passed. Please fix your code before submitting.`);
        return; // Don't submit to database
      }
      
      // All tests passed, proceed with submission
      const status = 'Accepted';
      
      // Use only problem ID for submission
      const problemIdForSubmission = problem.id;
      
      if (!problemIdForSubmission) {
        console.warn('Problem ID missing for submission');
        setSubmissionVerdict('Submission failed - missing problem ID');
        return;
      }

      // Map results to backend-required structure
      const mappedResults = results.map((r, idx) => {
        const tc = problem.testCases[idx] || {};
        return {
          testCaseId: tc.id || String(idx),
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          output: r.output,
          success: r.success,
          executionTime: r.executionTime,
          memoryUsage: r.memoryUsage,
          error: r.error || '',
        };
      });

      // Prepare submission data
      const submissionData = {
        problem: problemIdForSubmission,
        code,
        language: selectedLanguage,
        results: mappedResults,
        status,
        verdict: status,
        passedTests,
        totalTests,
        executionTime: mappedResults.reduce((acc, r) => acc + (r.executionTime || 0), 0),
        memoryUsage: Math.max(...mappedResults.map(r => r.memoryUsage || 0)),
      };
      
      // Submit to database
      await submitSolution(submissionData);
      setSubmissionVerdict('Accepted - Solution submitted successfully!');
      showNotification('Successfully submitted!', 'success');
    } catch (error) {
      setSubmissionVerdict('Submission failed - ' + (error instanceof Error ? error.message : 'Unknown error'));
      showNotification('Failed to submit', 'error');
      console.error('Error submitting solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomRun = async () => {
    if (!code.trim() || !customInput.trim() || !problem) return;
    setIsCustomRunning(true);
    try {
      const { results } = await executeCustomCode(code, selectedLanguage!, customInput);
      if (results[0]) {
        setCustomOutput(results[0].output || results[0].error || 'No output');
      }
    } catch (error) {
      setCustomOutput('Runtime Error: ' + error);
    } finally {
      setIsCustomRunning(false);
    }
  };

  // Add a summary error extraction function
  const getSummaryError = (results: ExecutionResult[]): string | null => {
    if (!results || results.length === 0) return null;
    // If all test cases have the same error, show it
    if (results.every(r => r.error && r.error === results[0].error)) {
      return results[0].error || null;
    }
    // If any test case has a compileError, show the first one
    const compileError = results.find(r => r.compileError)?.compileError;
    if (compileError) return compileError;
    // If any test case has a runtimeError, show the first one
    const runtimeError = results.find(r => r.runtimeError)?.runtimeError;
    if (runtimeError) return runtimeError;
    return null;
  };

  // When collapsing, store the current height
  const handleCollapseTerminal = () => {
    prevTerminalHeight.current = terminalHeight;
    setBottomCollapsed(true);
    setTerminalHeight(MIN_TERMINAL_PX);
  };
  // When expanding, restore the previous height
  const handleExpandTerminal = () => {
    setBottomCollapsed(false);
    setTerminalHeight(prevTerminalHeight.current || 220);
  };

  if (loading || languageLoading || !selectedLanguage) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (error || !problem) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error || 'Problem not found'}</div>;
  }

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
    <div className="fixed inset-0 h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 z-50" style={{padding:0, margin:0}}>
      {/* Popup Notification */}
      {showPopup && (
        <div className={clsx(
          'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg border-2 font-semibold text-sm transition-all duration-300 min-w-[300px]',
          popupType === 'success'
            ? 'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700 text-white'
            : 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700 text-white'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {popupType === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : (
                <XCircle className="h-5 w-5 text-white" />
              )}
              <span>{popupMessage}</span>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <XCircle className="h-4 w-4 text-white" />
            </button>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 rounded-b-lg overflow-hidden">
            <div 
              className={clsx(
                'h-full transition-all duration-75 ease-linear',
                popupType === 'success' ? 'bg-white' : 'bg-white'
              )}
              style={{ width: `${popupProgress}%` }}
            />
          </div>
        </div>
      )}
      
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
              <div className="flex items-center">
                <div className="relative group">
                  <button
                    onClick={() => window.history.back()}
                    className="text-lg font-bold text-gray-800 dark:text-gray-200 focus:outline-none bg-transparent border-none p-0 m-0 hover:bg-transparent"
                    aria-label="Back"
                    style={{ background: 'none', border: 'none' }}
                  >
                    &larr;
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-1 rounded bg-gray-700 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                    Back
                  </span>
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white truncate ml-2">{problem.title}</span>
              </div>
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
                  {['c', 'cpp', 'java', 'python'].map(key => (
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
                  {isRunning ? 'Running...' : <Play className="h-4 w-4" />}
                  <span>Run</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : <Save className="h-4 w-4" />}
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
              {bottomCollapsed ? (
                <div
                  className={clsx(
                    'flex items-center justify-between px-4 py-2 border-t-2 border-gray-300 dark:border-[#222a35] cursor-pointer',
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  )}
                  style={{ minHeight: MIN_TERMINAL_PX, maxHeight: MIN_TERMINAL_PX, height: MIN_TERMINAL_PX, position: 'relative' }}
                  onClick={handleExpandTerminal}
                  title="Show Result & Test Cases"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Result & Test Cases</span>
                  </div>
                </div>
              ) : (
                <div className={clsx('bg-white dark:bg-gray-800 border-t-2 border-gray-300 dark:border-[#222a35]', bottomCollapsed ? 'hidden' : '')} style={{ minHeight: MIN_TERMINAL_PX, maxHeight: Math.min(MAX_TERMINAL_HEIGHT, window.innerHeight - TOP_NAVBAR_HEIGHT - EDITOR_NAVBAR_HEIGHT - 60), height: '100%', overflow: 'auto' }}>
                  <div className={clsx("flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600",
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200')}
                  >
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Result & Test Cases</span>
                      {submissionVerdict && (
                        <span className={clsx(
                          'ml-2 px-2 py-1 rounded text-xs font-semibold',
                          submissionVerdict.includes('Accepted') || submissionVerdict.includes('successfully')
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600'
                        )}>
                          {submissionVerdict.includes('Accepted') || submissionVerdict.includes('successfully') ? 'Successfully submitted' : 'Failed to submit'}
                        </span>
                      )}
                    </div>
                    <button onClick={handleCollapseTerminal} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
                          <div key={test.id} className="mb-2 flex flex-row items-stretch gap-2">
                            {/* Test Case Info */}
                            <div className="w-1/3 min-w-[180px] max-w-[220px] p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 flex flex-col justify-between">
                              <div className="flex items-center gap-2 mb-1">
                                {testResults[idx] ? (
                                  testResults[idx].success ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )
                                ) : (
                                  test.isHidden ? <Clock className="h-4 w-4 text-yellow-400" /> : null
                                )}
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Test Case {idx + 1}</span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <strong>Input:</strong> <pre className="inline whitespace-pre-wrap">{test.input}</pre>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <strong>Expected Output:</strong> <pre className="inline whitespace-pre-wrap">{test.expectedOutput}</pre>
                              </div>
                            </div>
                            {/* User Output & Error */}
                            <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                              <div className="text-xs text-gray-700 dark:text-gray-200">
                                <strong>Your Output:</strong>
                                <pre className="whitespace-pre-wrap break-all">{testResults[idx]?.output ?? ''}</pre>
                              </div>
                              {testResults[idx]?.error && (
                                <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                  <strong>Error:</strong> <pre className="inline whitespace-pre-wrap">{testResults[idx].error}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {totalTests > 0 && (
                          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                            Passed {passedTests} / {totalTests} test cases
                          </div>
                        )}
                        {/* Test Results Status */}
                        {totalTests > 0 && testResults.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <div className="flex items-center gap-4 text-sm">
                              <div className={clsx('font-semibold', passedTests === totalTests ? 'text-green-600' : 'text-red-500')}>
                                {passedTests === totalTests ? 'All Tests Passed' : `${passedTests}/${totalTests} Tests Passed`}
                              </div>
                              {testResults.some(r => r.executionTime !== undefined) && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Avg Time: {Math.round(testResults.reduce((acc, r) => acc + (r.executionTime || 0), 0) / testResults.length)}ms
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Terminal Error Display */}
                        {terminalError && (
                          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-xs whitespace-pre-wrap">
                            <strong>Terminal Error:</strong>
                            {terminalError.trim() === 'Execution error' ? (
                              <div>
                                <pre className="whitespace-pre-wrap break-all">Internal server error or unknown backend error. Please check your code or contact support.</pre>
                              </div>
                            ) : (
                              <pre className="whitespace-pre-wrap break-all">{terminalError}</pre>
                            )}
                          </div>
                        )}
                        {getSummaryError(testResults) && (
                          <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-xs whitespace-pre-wrap">
                            <strong>Error:</strong>
                            <pre className="whitespace-pre-wrap break-all">{getSummaryError(testResults)}</pre>
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
                              <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <span className={clsx('font-semibold', result.success ? 'text-green-600' : 'text-red-500')}>{result.success ? 'Passed' : 'Failed'}</span>
                                <span className="text-xs text-gray-700 dark:text-gray-200">Execution Time: {result.executionTime !== undefined ? result.executionTime + ' ms' : 'N/A'}</span>
                                <span className="text-xs text-gray-700 dark:text-gray-200">Memory: {result.memoryUsage !== undefined ? result.memoryUsage + ' MB' : 'N/A'}</span>
                              </div>
                              {result.error && (
                                <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                  <strong>Error:</strong> <pre className="inline whitespace-pre-wrap">{result.error}</pre>
                                </div>
                              )}
                              {result.output && !result.success && (
                                <div className="mt-1 text-xs text-gray-700 dark:text-gray-200">
                                  <strong>Your Output:</strong> <pre className="inline whitespace-pre-wrap">{result.output}</pre>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {activeTab === 'custom' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-start">
                          {/* Input Box (reduced width, colored border) */}
                          <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="w-1/2 min-w-[180px] max-w-[320px] h-20 rounded p-2 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400"
                            placeholder="Enter custom input"
                          />
                          {/* Output Box beside input */}
                          <div className="flex-1 p-2 bg-gray-50 rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-h-[80px]">
                            <strong>Output:</strong>
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{customOutput}</pre>
                          </div>
                        </div>
                        {/* Test Results Status */}
                        {totalTests > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className={clsx('font-semibold', passedTests === totalTests ? 'text-green-600' : 'text-red-500')}>
                              {passedTests === totalTests ? 'All Tests Passed' : `${passedTests}/${totalTests} Tests Passed`}
                            </div>
                            {testResults.length > 0 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {testResults.some(r => r.executionTime !== undefined) && (
                                  <span>Avg Time: {Math.round(testResults.reduce((acc, r) => acc + (r.executionTime || 0), 0) / testResults.length)}ms</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={handleCustomRun}
                          disabled={isCustomRunning}
                          className="mt-2 w-fit px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {isCustomRunning ? 'Running...' : 'Run'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Split>
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