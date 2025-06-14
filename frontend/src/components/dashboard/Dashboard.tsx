import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockProblems, mockContests, mockSubmissions } from '../../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for charts
  const submissionData = [
    { date: '2024-01-01', submissions: 12 },
    { date: '2024-01-02', submissions: 19 },
    { date: '2024-01-03', submissions: 8 },
    { date: '2024-01-04', submissions: 15 },
    { date: '2024-01-05', submissions: 22 },
    { date: '2024-01-06', submissions: 18 },
    { date: '2024-01-07', submissions: 25 },
  ];

  const languageData = [
    { name: 'Python', value: 45, color: '#3776ab' },
    { name: 'C++', value: 30, color: '#00599c' },
    { name: 'Java', value: 15, color: '#ed8b00' },
    { name: 'JavaScript', value: 10, color: '#f7df1e' },
  ];

  const stats = [
    { name: 'Problems Solved', value: user?.solvedProblems || 0, icon: CheckCircle2, color: 'text-green-600' },
    { name: 'Total Submissions', value: user?.submissions || 0, icon: Code2, color: 'text-blue-600' },
    { name: 'Current Rating', value: user?.rating || 0, icon: TrendingUp, color: 'text-purple-600' },
    { name: 'Contest Rank', value: 1247, icon: Trophy, color: 'text-yellow-600' },
  ];

  const recentProblems = mockProblems.slice(0, 3);
  const upcomingContests = mockContests.filter(c => c.status === 'Upcoming');

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
        <p className="mt-2 opacity-90">Continue your coding journey and reach new heights.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={submissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#F9FAFB'
                }}
              />
              <Area type="monotone" dataKey="submissions" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-4">
            {languageData.map((lang) => (
              <div key={lang.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Problems */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Problems</h3>
            <Link to="/problems" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentProblems.map((problem) => (
              <Link
                key={problem.id}
                to={`/problems/${problem.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{problem.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{problem.difficulty}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {problem.acceptanceRate.toFixed(1)}%
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Contests</h3>
            <Link to="/contests" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingContests.length > 0 ? upcomingContests.map((contest) => (
              <div
                key={contest.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{contest.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{contest.startTime.toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <Link
                  to={`/contests/${contest.id}`}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Register
                </Link>
              </div>
            )) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming contests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;