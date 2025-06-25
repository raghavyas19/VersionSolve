import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save, ArrowLeft, Terminal, CheckCircle2, XCircle, Clock, MemoryStick, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Problem, Language, ExecutionResult } from '../../types';
import { LANGUAGES } from '../../utils/constants';
import { compileCode, runTestCases } from '../../utils/codeExecution';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebarVisibility, useEditorVisibility } from '../common/Layout';
import SplitPane from 'react-split-pane';

interface CodeEditorProps {
  problem: Problem;
  onBack: () => void;
}

// Helper for user avatar
function UserAvatar({ user }: { user: any }) {
  if (user?.avatar) {
    return <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />;
  }
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (user?.username?.[0] || 'U').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
      {initials}
    </div>
  );
}

// Slim top navbar for code editor page
function SlimTopNavbar({ user, theme, toggleTheme }: { user: any, theme: string, toggleTheme: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style={{ minHeight: 36, height: 36 }}>
      <img src="/Favicon.png" alt="Favicon" className="w-7 h-7" />
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-gray-700" />}
        </button>
        <span className="font-medium text-gray-900 dark:text-white text-xs">{user?.name || user?.username || 'User'}</span>
        <UserIcon className="w-7 h-7 text-gray-500 dark:text-gray-300" />
      </div>
    </div>
  );
}

const CodeEditor: React.FC<CodeEditorProps> = ({ problem, onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [code, setCode] = useState(LANGUAGES[selectedLanguage].template);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<ExecutionResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [activeTab, setActiveTab] = useState<'testcases' | 'result' | 'custom'>('testcases');
  const editorRef = useRef<any>(null);
  const { setHidden } = useSidebarVisibility();
  const { setEditorOpen } = useEditorVisibility();
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [split, setSplit] = useState(50); // percent for vertical split
  const [terminalHeight, setTerminalHeight] = useState(220); // px for horizontal split

  // User-specific localStorage key
  const getStorageKey = () => {
    return `code_${user?.id || 'guest'}_${problem.id}_${selectedLanguage}`;
  };

  // Load code from localStorage on mount/user/problem/language change
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      setCode(saved);
    } else {
      setCode(LANGUAGES[selectedLanguage].template);
    }
    // eslint-disable-next-line
  }, [user?.id, problem.id, selectedLanguage]);

  // Save code to localStorage on change
  useEffect(() => {
    localStorage.setItem(getStorageKey(), code);
    // eslint-disable-next-line
  }, [code, user?.id, problem.id, selectedLanguage]);

  useEffect(() => {
    setHidden(true);
    setEditorOpen(true);
    return () => {
      setHidden(false);
      setEditorOpen(false);
    };
  }, [setHidden, setEditorOpen]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setCode(LANGUAGES[language].template);
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setActiveTab('result');
    
    try {
      // First compile the code
      const compileResult = await compileCode(code, selectedLanguage);
      
      if (!compileResult.success) {
        setTestResults([]);
        return;
      }

      // Run test cases
      const results = await runTestCases(code, selectedLanguage, problem.testCases);
      setTestResults(results);
    } catch (error) {
      // console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCustomRun = async () => {
    if (!code.trim() || !customInput.trim()) return;
    
    setIsRunning(true);
    
    try {
      const compileResult = await compileCode(code, selectedLanguage);
      
      if (!compileResult.success) {
        setCustomOutput(`Compilation Error: ${compileResult.error}`);
        return;
      }

      // Execute with custom input
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

  const passedTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Slim Top Navbar */}
      <SlimTopNavbar user={user} theme={theme} toggleTheme={toggleTheme} />

      {/* Problem/Editor Navbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style={{ minHeight: 44, height: 44 }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold text-gray-900 dark:text-white ml-2">{problem.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minWidth: 100 }}
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>{lang.name}</option>
            ))}
          </select>
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

      {/* Main Content: Resizable SplitPane */}
      <SplitPane
        split="vertical"
        minSize={200}
        maxSize={-200}
        size={`${split}%`}
        onChange={size => setSplit(typeof size === 'number' ? (size / window.innerWidth) * 100 : 50)}
        allowResize
        paneStyle={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        style={{ position: 'relative', flex: 1 }}
        resizerStyle={{ background: '#e5e7eb', width: 6, cursor: 'col-resize', zIndex: 10 }}
      >
        {/* Left: Problem Statement */}
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br>') }} />
          {problem.examples && problem.examples.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Examples</h3>
              {problem.examples.map((example, idx) => (
                <div key={idx} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="mb-2"><strong>Input:</strong> <pre className="inline whitespace-pre-wrap">{example.input}</pre></div>
                  <div className="mb-2"><strong>Output:</strong> <pre className="inline whitespace-pre-wrap">{example.output}</pre></div>
                  {example.explanation && <div><strong>Explanation:</strong> {example.explanation}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Code Editor and collapsible terminal */}
        <SplitPane
          split="horizontal"
          minSize={40}
          maxSize={-40}
          size={terminalOpen ? terminalHeight : 40}
          onChange={size => {
            if (typeof size === 'number') setTerminalHeight(size);
          }}
          allowResize
          pane2Style={{ display: terminalOpen ? 'block' : 'none', transition: 'height 0.2s' }}
          resizerStyle={{ background: '#e5e7eb', height: 6, cursor: 'row-resize', zIndex: 10, position: 'relative' }}
          style={{ position: 'relative', height: '100%' }}
        >
          {/* Code Editor */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                language={LANGUAGES[selectedLanguage].monacoLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  renderWhitespace: 'selection',
                  tabSize: 2,
                }}
              />
            </div>
          </div>
          {/* Collapsible Terminal Panel */}
          <div className={clsx(
            'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300',
            terminalOpen ? '' : 'h-10',
            'overflow-hidden'
          )}>
            <div className="flex items-center px-4 py-2 cursor-pointer select-none" onClick={() => setTerminalOpen((v) => !v)}>
              <Terminal className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{terminalOpen ? 'Hide' : 'Show'} Test Cases & Console</span>
              <span className="ml-auto text-xs text-gray-400">{terminalOpen ? '▼' : '▲'}</span>
            </div>
            {terminalOpen && (
              <div className="h-full flex flex-col">
                <nav className="flex border-b border-gray-200 dark:border-gray-700">
                  {[
                    { id: 'testcases', name: 'Test Cases' },
                    { id: 'result', name: 'Result' },
                    { id: 'custom', name: 'Console' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={clsx(
                        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      )}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
                <div className="flex-1 overflow-auto p-4">
                  {activeTab === 'testcases' && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">Test Cases</h3>
                      {problem.testCases.filter(tc => !tc.isHidden).map((testCase, index) => (
                        <div key={testCase.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Test Case {index + 1}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Input:</span>
                              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                                {testCase.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Expected:</span>
                              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                                {testCase.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'result' && (
                    <div className="space-y-4">
                      {testResults.length > 0 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Results: {passedTests}/{totalTests}
                            </span>
                            {passedTests === totalTests ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {passedTests === totalTests ? 'All tests passed!' : `${totalTests - passedTests} test(s) failed`}
                          </div>
                        </div>
                      )}
                      {testResults.map((result, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Test Case {index + 1}
                            </span>
                            {result.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{result.executionTime}ms</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MemoryStick className="h-3 w-3" />
                                <span>{result.memoryUsage.toFixed(1)}MB</span>
                              </span>
                            </div>
                            {!result.success && (
                              <div>
                                <span className="text-red-500">Output:</span>
                                <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded overflow-x-auto">
                                  {result.output || result.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'custom' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Input
                        </label>
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter your input here..."
                          className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleCustomRun}
                        disabled={isRunning}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isRunning ? <LoadingSpinner size="sm" /> : <Terminal className="h-4 w-4" />}
                        <span>Run</span>
                      </button>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Output
                        </label>
                        <pre className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm overflow-auto">
                          {customOutput || 'Output will appear here...'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SplitPane>
      </SplitPane>
    </div>
  );
};

export default CodeEditor;