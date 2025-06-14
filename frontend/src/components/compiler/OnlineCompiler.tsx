import React, { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MemoryStick,
  Sparkles,
  FileText,
  Code2,
  ArrowLeft
} from 'lucide-react';
import { Language, ExecutionResult, AIReview } from '../../types';
import { LANGUAGES } from '../../utils/constants';
import { executeCodeWithInput, generateAIReview } from '../../utils/codeExecution';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const OnlineCompiler: React.FC = () => {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [code, setCode] = useState(LANGUAGES[selectedLanguage].template);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'review'>('input');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setCode(LANGUAGES[language].template);
    setOutput('');
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setActiveTab('output');
    setOutput('Running...');
    
    try {
      const result = await executeCodeWithInput(code, selectedLanguage, input);
      setExecutionResult(result);
      setOutput(result.output || result.error || 'No output');
    } catch (error) {
      setOutput('Error: ' + error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAIReview = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setActiveTab('review');
    
    try {
      const review = await generateAIReview(code, selectedLanguage);
      setAiReview(review);
    } catch (error) {
      console.error('AI Review failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${LANGUAGES[selectedLanguage].extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    setCode(LANGUAGES[selectedLanguage].template);
    setInput('');
    setOutput('');
    setExecutionResult(null);
    setAiReview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Full-width header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Online Compiler</h1>
            </div>
            
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={`.${LANGUAGES[selectedLanguage].extension},.txt`}
              onChange={handleLoadCode}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Load</span>
            </button>
            
            <button
              onClick={handleSaveCode}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Save</span>
            </button>
            
            <button
              onClick={handleAIReview}
              disabled={isAnalyzing}
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isAnalyzing ? <LoadingSpinner size="sm" /> : <Sparkles className="h-4 w-4" />}
              <span className="hidden sm:inline">AI Review</span>
            </button>
            
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-1 px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isRunning ? <LoadingSpinner size="sm" /> : <Play className="h-4 w-4" />}
              <span>Run</span>
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size:
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{fontSize}px</span>
              </div>
              
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
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
                  fontSize: fontSize,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  renderWhitespace: 'selection',
                  tabSize: 2,
                  lineNumbers: 'on',
                  folding: true,
                  bracketMatching: 'always',
                  autoIndent: 'full',
                }}
              />
            </div>
          </div>
        </div>

        {/* Input/Output Panel */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {[
                { id: 'input', name: 'Input', icon: Terminal },
                { id: 'output', name: 'Output', icon: FileText },
                { id: 'review', name: 'AI Review', icon: Sparkles }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors flex-1 justify-center',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'input' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Standard Input
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input for your program..."
                    className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>• Enter input data that your program will read from stdin</p>
                  <p>• Each line will be passed to your program sequentially</p>
                  <p>• Leave empty if your program doesn't require input</p>
                </div>
              </div>
            )}

            {activeTab === 'output' && (
              <div className="space-y-4">
                {executionResult && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Execution Status
                      </span>
                      {executionResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{executionResult.executionTime}ms</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MemoryStick className="h-3 w-3" />
                        <span>{executionResult.memoryUsage.toFixed(1)}MB</span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Program Output
                  </label>
                  <pre className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono overflow-auto whitespace-pre-wrap">
                    {output || 'Output will appear here after running your code...'}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-4">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <LoadingSpinner size="lg" className="mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Analyzing your code...</p>
                    </div>
                  </div>
                ) : aiReview ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Code Quality</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{aiReview.codeQuality}/10</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">Readability</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{aiReview.readabilityScore}/10</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Complexity Analysis</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Time: {aiReview.complexityAnalysis.time}</p>
                        <p>Space: {aiReview.complexityAnalysis.space}</p>
                      </div>
                    </div>
                    
                    {aiReview.optimizationSuggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Optimization Suggestions</h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {aiReview.optimizationSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {aiReview.bestPractices.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Best Practices</h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {aiReview.bestPractices.map((practice, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {aiReview.styleIssues.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Style Issues</h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {aiReview.styleIssues.map((issue, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500 mt-1">⚠</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Click "AI Review" to analyze your code</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCompiler;