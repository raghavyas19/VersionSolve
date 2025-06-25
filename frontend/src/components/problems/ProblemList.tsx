import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock, Users, Lock } from 'lucide-react';
// import { mockProblems } from '../../data/mockData';
import { DIFFICULTY_COLORS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';
import { fetchProblems } from '../../utils/api';

const ProblemList: React.FC = () => {
  const { user, setRedirectPath } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProblems();
        // Map _id to id for frontend compatibility
        const mapped = data.map((p: any) => ({ ...p, id: p._id || p.id }));
        setProblems(mapped);
      } catch (err: any) {
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    loadProblems();
  }, []);

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (problem.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesTag = tagFilter === 'all' || (problem.tags || []).includes(tagFilter);
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const allTags = Array.from(new Set(problems.flatMap((p: any) => p.tags || [])));

  const handleProblemClick = (problemId: string, e: React.MouseEvent) => {
    // Allow normal navigation for authenticated users
    if (user) {
      return;
    }

    // For guest users, show login prompt for solve action
    // But allow viewing problem details
    const target = e.target as HTMLElement;
    if (target.closest('.solve-button')) {
      e.preventDefault();
      setRedirectPath(`/problems/${problemId}`);
      navigate('/login', { state: { from: `/problems/${problemId}` } });
    }
  };

  const handleLoginToSolve = (problemId: string, action: 'login' | 'signup') => {
    setRedirectPath(`/problems/${problemId}`);
    navigate(`/${action}`, { state: { from: `/problems/${problemId}` } });
  };

  const handleSolveProblem = (problemId: string) => {
    navigate(`/problems/solve/${problemId}`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading problems...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 overflow-x-hidden font-sans">
      <div className="flex flex-col sm:flex-row gap-4 py-1 mx-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
          <div className="flex items-center space-x-3">
            <Lock className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Browsing as Guest</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                You can view all problems, but need to sign in to submit solutions. You'll be redirected back after logging in.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card layout for mobile */}
      <div className="md:hidden space-y-3">
        {filteredProblems.map((problem) => (
          <div key={problem.id} className="w-full rounded-lg shadow border p-3 bg-[var(--color-surface)] flex flex-col gap-1 text-sm break-words">
            <div className="flex items-center justify-between w-full">
              <Link to={`/problems/${problem.id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-base truncate w-3/4 break-words">
                {problem.title}
              </Link>
              <span className={clsx(
                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]
              )}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400 w-full break-words">
              {problem.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded break-words">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs w-full break-words">
              <span>{problem.submissions} submissions</span>
              <span>{problem.acceptanceRate.toFixed(1)}% accepted</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs w-full break-words">
              <span>Time: {problem.timeLimit}s</span>
              <span>Memory: {problem.memoryLimit}MB</span>
            </div>
            {!user && (
              <div className="flex gap-1 mt-1 w-full">
                <button
                  className="solve-button flex-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoginToSolve(problem.id, 'login');
                  }}
                >
                  Sign In
                </button>
                <button
                  className="solve-button flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoginToSolve(problem.id, 'signup');
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
            {user && (
              <button
                className="solve-button flex-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                onClick={() => handleSolveProblem(problem.id)}
              >
                Solve Problem
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Table layout for desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acceptance
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProblems.map((problem) => (
                <tr 
                  key={problem.id} 
                  className="transition-colors"
                  onClick={(e) => handleProblemClick(problem.id, e)}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center space-x-3">
                      
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/problems/${problem.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors block truncate"
                        >
                          {problem.title}
                        </Link>
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 space-x-2 sm:space-x-4">
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{problem.submissions}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{problem.timeLimit}s</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={clsx(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]
                    )}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {problem.acceptanceRate.toFixed(1)}%
                  </td>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {problem.tags.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          +{problem.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {!user ? (
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button
                          className="solve-button flex items-center justify-center space-x-1 px-2 sm:px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLoginToSolve(problem.id, 'login');
                          }}
                        >
                          <Lock className="h-3 w-3" />
                          <span className="hidden sm:inline">Sign In</span>
                        </button>
                        <button
                          className="solve-button flex items-center justify-center space-x-1 px-2 sm:px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLoginToSolve(problem.id, 'signup');
                          }}
                        >
                          <span className="hidden sm:inline">Sign Up</span>
                          <span className="sm:hidden">+</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="solve-button flex items-center justify-center space-x-1 px-2 sm:px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSolveProblem(problem.id);
                        }}
                      >
                        <span className="hidden sm:inline">Solve Problem</span>
                        <span className="sm:hidden">→</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No problems found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProblemList;