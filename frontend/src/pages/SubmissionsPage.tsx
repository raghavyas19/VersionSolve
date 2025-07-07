import React, { useState, useEffect } from 'react';
import { Clock, Code, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { VERDICT_COLORS } from '../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { fetchUserSubmissions } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Submission {
  _id: string;
  problem: {
    _id: string;
    title: string;
    difficulty: string;
    tags: string[];
  };
  language: string;
  status: string;
  verdict: string;
  executionTime: number;
  memoryUsage: number;
  passedTests: number;
  totalTests: number;
  submittedAt: string;
}

const SubmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchUserSubmissions(undefined, pagination.page, pagination.limit);
        setSubmissions(response.submissions);
        setPagination(response.pagination);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load submissions');
        console.error('Error loading submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [user, pagination.page, pagination.limit]);

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

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Please log in</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You need to be logged in to view your submissions.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading submissions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your progress and review your submission history.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Problem
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Language
                </th>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Runtime
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.map((submission) => {
                const VerdictIcon = getVerdictIcon(submission.status);
                const isAccepted = submission.status === 'Accepted';
                
                return (
                  <tr key={submission._id} className={clsx(
                    'bg-gray-900 hover:bg-gray-800 transition-colors'
                  )}>
                    <td className="px-4 sm:px-6 py-2">
                      <div>
                        <div 
                          className={clsx(
                            'text-sm font-medium truncate',
                            submission.problem ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                          )}
                          onClick={() => submission.problem && navigate(`/problems/${submission.problem._id}`)}
                          tabIndex={submission.problem ? 0 : -1}
                          role="button"
                          aria-disabled={!submission.problem}
                        >
                          {submission.problem?.title || 'Unknown Problem'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.passedTests}/{submission.totalTests} test cases
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-2">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {submission.language}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-2">
                      <div className="flex items-center space-x-2">
                        <VerdictIcon className={clsx(
                          'h-4 w-4 flex-shrink-0',
                          submission.status === 'Accepted' ? 'text-green-500' : 'text-red-500'
                        )} />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${VERDICT_COLORS[submission.status as keyof typeof VERDICT_COLORS]}`}
                        >
                          {submission.status}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-2 text-sm text-gray-900 dark:text-white">
                      {submission.executionTime ? `${submission.executionTime}ms` : '-'}
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-2 text-sm text-gray-900 dark:text-white">
                      {submission.memoryUsage ? `${submission.memoryUsage.toFixed(1)}MB` : '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatDistanceToNow(submission.submittedAt, { addSuffix: true })}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <Code className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No submissions yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start solving problems to see your submissions here.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} submissions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;