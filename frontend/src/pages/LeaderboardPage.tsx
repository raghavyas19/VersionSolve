import React, { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, User, Lock } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const LeaderboardPage: React.FC = () => {
  const { user, setRedirectPath } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  
  // Sort users by rating for leaderboard
  const sortedUsers = [...mockUsers].sort((a, b) => b.rating - a.rating);

  const handleLoginRedirect = () => {
    setRedirectPath('/leaderboard');
    navigate('/login', { state: { from: '/leaderboard' } });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return 'text-red-600 dark:text-red-400';
    if (rating >= 1600) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1200) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 2000) return { label: 'Expert', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' };
    if (rating >= 1600) return { label: 'Advanced', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' };
    if (rating >= 1200) return { label: 'Intermediate', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' };
    return { label: 'Beginner', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' };
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          See how you rank among the community's top programmers.
        </p>
      </div>

      {/* Guest User Overlay */}
      {!user && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md mx-4">
            <Lock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join the Competition
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sign in to view the leaderboard and see where you rank among the top coders in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoginRedirect}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setRedirectPath('/leaderboard');
                  navigate('/signup', { state: { from: '/leaderboard' } });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeframe Filter */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'month', label: 'This Month' },
            { key: 'week', label: 'This Week' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeframe(option.key as any)}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                timeframe === option.key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedUsers.slice(0, 3).map((user, index) => {
          const rank = index + 1;
          const badge = getRatingBadge(user.rating);
          
          return (
            <div
              key={user.id}
              className={clsx(
                'bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 p-6 text-center',
                rank === 1 ? 'border-yellow-200 dark:border-yellow-700' :
                rank === 2 ? 'border-gray-200 dark:border-gray-600' :
                'border-amber-200 dark:border-amber-700'
              )}
            >
              <div className="flex justify-center mb-4">
                {getRankIcon(rank)}
              </div>
              
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.username}</h3>
                <span className={clsx('inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1', badge.color)}>
                  {badge.label}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className={clsx('text-2xl font-bold', getRatingColor(user.rating))}>
                  {user.rating}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {user.solvedProblems} problems solved
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Problems Solved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedUsers.map((user, index) => {
                const rank = index + 1;
                const badge = getRatingBadge(user.rating);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className={clsx('text-lg font-semibold', getRatingColor(user.rating))}>
                          {user.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.solvedProblems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.submissions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx('inline-flex px-2 py-1 text-xs font-medium rounded-full', badge.color)}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;