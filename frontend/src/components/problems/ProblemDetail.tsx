import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MemoryStick, Users, CheckCircle2, Play, Lock, Code, XCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { mockProblems } from '../../data/mockData';
import { DIFFICULTY_COLORS, VERDICT_COLORS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import CodeEditor from '../editor/CodeEditor';
import { clsx } from 'clsx';
import { fetchProblemById, fetchUserSubmissions } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, setRedirectPath } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'discussion'>('description');
  const [showEditor, setShowEditor] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const data = await fetchProblemById(id);
          setProblem(data);
        }
      } catch (err: any) {
        setError('Problem not found');
      } finally {
        setLoading(false);
      }
    };
    loadProblem();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12">Loading problem...</div>;
  }
  if (error || !problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Problem not found</h2>
        <Link to="/problems" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-4 inline-block">
          ← Back to Problems
        </Link>
      </div>
    );
  }

  const handleSolveProblem = () => {
    if (user) {
      navigate(`/problems/solve/${id}`);
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

  const loadSubmissions = async () => {
    if (!user || !id) return;
    
    try {
      setSubmissionsLoading(true);
      setSubmissionsError(null);
      const response = await fetchUserSubmissions(id, 1, 50); // Load first 50 submissions for this problem
      setSubmissions(response.submissions);
    } catch (err: any) {
      setSubmissionsError(err.response?.data?.message || 'Failed to load submissions');
      console.error('Error loading submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleTabChange = (tabId: 'description' | 'submissions' | 'discussion') => {
    setActiveTab(tabId);
    if (tabId === 'submissions' && user) {
      loadSubmissions();
    }
  };

  const getVerdictIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return CheckCircle2;
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <Link
            to="/problems"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate font-space-grotesk">{problem.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
              <span className={clsx(
                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]
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
            'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Login Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
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
              <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                {[
                  { id: 'description', name: 'Description' },
                  { id: 'submissions', name: 'Submissions' },
                  { id: 'discussion', name: 'Discussion' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={clsx(
                      'py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
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

            <div className="p-4 sm:p-6">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br>') }} />
                  
                  {problem.examples.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 font-space-grotesk">Examples</h3>
                      {problem.examples.map((example: any, index: number) => (
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
                    <>
                      {submissionsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading submissions...</p>
                        </div>
                      ) : submissionsError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading submissions</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{submissionsError}</p>
                        </div>
                      ) : submissions.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Language
                                  </th>
                                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Runtime
                                  </th>
                                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Memory
                                  </th>
                                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Submitted
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {submissions.map((submission) => {
                                  const VerdictIcon = getVerdictIcon(submission.status);
                                  
                                  return (
                                    <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                      <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <Code className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {submission.language}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <VerdictIcon className={clsx(
                                            'h-4 w-4 flex-shrink-0',
                                            submission.status === 'Accepted' ? 'text-green-500' : 'text-red-500'
                                          )} />
                                          <span className={clsx(
                                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                            VERDICT_COLORS[submission.status]
                                          )}>
                                            {submission.status}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {submission.executionTime ? `${submission.executionTime}ms` : '-'}
                                      </td>
                                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {submission.memoryUsage ? `${submission.memoryUsage.toFixed(1)}MB` : '-'}
                                      </td>
                                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">{formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Code className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No submissions yet</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Solve the problem to see your submissions here.
                          </p>
                        </div>
                      )}
                    </>
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
              {problem.tags.map((tag: string) => (
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