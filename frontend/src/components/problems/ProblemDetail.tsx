import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MemoryStick, Users, CheckCircle2, Play, Lock } from 'lucide-react';
import { mockProblems } from '../../data/mockData';
import { DIFFICULTY_COLORS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import CodeEditor from '../editor/CodeEditor';
import { clsx } from 'clsx';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, setRedirectPath } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'discussion'>('description');
  const [showEditor, setShowEditor] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const problem = mockProblems.find(p => p.id === id);

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Problem not found</h2>
        <Link to="/problems" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-4 inline-block">
          ← Back to Problems
        </Link>
      </div>
    );
  }

  if (showEditor) {
    return <CodeEditor problem={problem} onBack={() => setShowEditor(false)} />;
  }

  const handleSolveProblem = () => {
    if (user) {
      setShowEditor(true);
    } else {
      setShowLoginPrompt(true);
    }
  };

  const handleLoginRedirect = () => {
    // Set the current problem page as redirect path
    setRedirectPath(`/problems/${id}`);
    navigate('/login', { state: { from: `/problems/${id}` } });
  };

  const handleSignupRedirect = () => {
    setRedirectPath(`/problems/${id}`);
    navigate('/signup', { state: { from: `/problems/${id}` } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/problems"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{problem.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={clsx(
                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                DIFFICULTY_COLORS[problem.difficulty]
              )}>
                {problem.difficulty}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Acceptance Rate: {problem.acceptanceRate}%
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSolveProblem}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
            user 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          )}
        >
          {user ? (
            <>
              <Play className="h-4 w-4" />
              <span>Solve Problem</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Login to Solve</span>
            </>
          )}
        </button>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="text-center">
              <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Login Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to be logged in to submit solutions. After logging in, you'll be redirected back to this problem.
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignupRedirect}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'description', name: 'Description' },
                  { id: 'submissions', name: 'Submissions' },
                  { id: 'discussion', name: 'Discussion' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br>') }} />
                  
                  {problem.examples.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Examples</h3>
                      {problem.examples.map((example, index) => (
                        <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="mb-2">
                            <strong>Input:</strong>
                            <pre className="mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                              {example.input}
                            </pre>
                          </div>
                          <div className="mb-2">
                            <strong>Output:</strong>
                            <pre className="mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                              {example.output}
                            </pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <strong>Explanation:</strong>
                              <p className="mt-1 text-sm">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Submissions</h3>
                  {user ? (
                    <p className="text-gray-500 dark:text-gray-400">No submissions yet. Solve the problem to see your submissions here.</p>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Please log in to view your submissions.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={handleLoginRedirect}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={handleSignupRedirect}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Discussion</h3>
                  {user ? (
                    <p className="text-gray-500 dark:text-gray-400">No discussions yet. Be the first to start a discussion!</p>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Please log in to participate in discussions.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={handleLoginRedirect}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={handleSignupRedirect}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Constraints</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Time Limit: {problem.timeLimit}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Memory: {problem.memoryLimit}MB</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{problem.submissions} submissions</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {!user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Want to Submit?</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                Create an account to submit solutions and track your progress. You'll be redirected back here after signing in.
              </p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleSignupRedirect}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Already have an account?
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;