import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, Play, Lock } from 'lucide-react';
import { mockContests } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { clsx } from 'clsx';

const ContestsPage: React.FC = () => {
  const { user, setRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleContestAction = (contestId: string, action: 'join' | 'register') => {
    if (user) {
      // Handle contest action for authenticated users
      console.log(`${action} contest ${contestId}`);
    } else {
      setRedirectPath('/contests');
      navigate('/login', { state: { from: '/contests' } });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'Upcoming':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'Ended':
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getTimeRemaining = (contest: any) => {
    const now = new Date();
    if (contest.status === 'Upcoming') {
      return `Starts ${formatDistanceToNow(contest.startTime, { addSuffix: true })}`;
    } else if (contest.status === 'Running') {
      return `Ends ${formatDistanceToNow(contest.endTime, { addSuffix: true })}`;
    } else {
      return `Ended ${formatDistanceToNow(contest.endTime, { addSuffix: true })}`;
    }
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contests</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Participate in programming contests and compete with developers worldwide.
        </p>
      </div>

      {/* Guest User Notice */}
      {!user && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
          <div className="flex items-center space-x-3">
            <Lock className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Join Contests</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Sign in to participate in contests and compete with other developers. You can view contest details as a guest.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {mockContests.map((contest) => (
          <div
            key={contest.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {contest.title}
                    </h3>
                    <span className={clsx(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit',
                      getStatusColor(contest.status)
                    )}>
                      {contest.status}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">{contest.description}</p>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{format(contest.startTime, 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{getTimeRemaining(contest)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{contest.participants.toLocaleString()} participants</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {contest.problems.length} problems • {contest.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-6">
                  {contest.status === 'Running' && (
                    <button 
                      onClick={() => handleContestAction(contest.id, 'join')}
                      className={clsx(
                        'flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                        user 
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      )}
                    >
                      {user ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      <span>{user ? 'Join Contest' : 'Login to Join'}</span>
                    </button>
                  )}
                  
                  {contest.status === 'Upcoming' && (
                    <button 
                      onClick={() => handleContestAction(contest.id, 'register')}
                      className={clsx(
                        'flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                        user 
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      )}
                    >
                      {user ? <Calendar className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      <span>{user ? 'Register' : 'Login to Register'}</span>
                    </button>
                  )}
                  
                  <Link
                    to={`/contests/${contest.id}`}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {contest.status === 'Running' && (
              <div className="px-4 sm:px-6 py-3 bg-green-50 dark:bg-green-900/10 border-t border-green-200 dark:border-green-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Contest is live!
                  </span>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Time remaining: {formatDistanceToNow(contest.endTime)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {mockContests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No contests available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Check back later for upcoming programming contests.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContestsPage;