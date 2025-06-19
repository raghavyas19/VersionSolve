import React from 'react';
import { Clock, Code, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { mockSubmissions, mockProblems } from '../data/mockData';
import { VERDICT_COLORS } from '../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const SubmissionsPage: React.FC = () => {
  const getVerdictIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return CheckCircle2;
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

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
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Problem
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
              {mockSubmissions.map((submission) => {
                const problem = mockProblems.find(p => p.id === submission.problemId);
                const VerdictIcon = getVerdictIcon(submission.status);
                
                return (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate">
                          {problem?.title || 'Unknown Problem'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{submission.problemId} • {submission.passedTests}/{submission.totalTests} test cases
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
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

      {mockSubmissions.length === 0 && (
        <div className="text-center py-12">
          <Code className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No submissions yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start solving problems to see your submissions here.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;