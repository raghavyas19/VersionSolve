import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Code, 
  Trophy, 
  TrendingUp, 
  Activity,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { AdminStats } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock admin statistics
  const stats: AdminStats = {
    totalUsers: 1247,
    totalProblems: 156,
    totalSubmissions: 8934,
    totalContests: 23,
    recentActivity: [
      {
        id: '1',
        type: 'submission',
        description: 'user123 submitted solution for Two Sum',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        userId: '1',
        username: 'user123'
      },
      {
        id: '2',
        type: 'problem',
        description: 'New problem "Binary Tree Traversal" added',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        userId: '2',
        username: 'admin'
      },
      {
        id: '3',
        type: 'user',
        description: 'New user registration: coder_ninja',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        userId: '3',
        username: 'coder_ninja'
      },
      {
        id: '4',
        type: 'contest',
        description: 'Weekly Contest 385 started',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: '2',
        username: 'admin'
      }
    ],
    languageStats: [
      { language: 'Python', count: 3245, percentage: 36.3 },
      { language: 'C++', count: 2678, percentage: 30.0 },
      { language: 'Java', count: 1789, percentage: 20.0 },
      { language: 'JavaScript', count: 892, percentage: 10.0 },
      { language: 'C', count: 330, percentage: 3.7 }
    ],
    submissionTrends: [
      { date: '2024-01-01', submissions: 145, accepted: 87 },
      { date: '2024-01-02', submissions: 167, accepted: 98 },
      { date: '2024-01-03', submissions: 134, accepted: 76 },
      { date: '2024-01-04', submissions: 189, accepted: 112 },
      { date: '2024-01-05', submissions: 203, accepted: 134 },
      { date: '2024-01-06', submissions: 178, accepted: 98 },
      { date: '2024-01-07', submissions: 156, accepted: 89 }
    ]
  };

  const quickStats = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Total Problems', value: stats.totalProblems, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'Total Submissions', value: stats.totalSubmissions, icon: Code, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { name: 'Active Contests', value: stats.totalContests, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return Code;
      case 'problem': return BookOpen;
      case 'user': return Users;
      case 'contest': return Trophy;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'submission': return 'text-blue-600';
      case 'problem': return 'text-green-600';
      case 'user': return 'text-purple-600';
      case 'contest': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor platform activity and manage system resources.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
        {/* Submission Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submission Trends</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.submissionTrends}>
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
              <Area type="monotone" dataKey="submissions" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="accepted" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language Usage</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={stats.languageStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="count"
              >
                {stats.languageStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.languageStats.map((lang, index) => (
              <div key={lang.language} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {lang.language} ({lang.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                    <ActivityIcon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Judge Server</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Queue Status</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                12 pending
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
              <span className="text-sm text-gray-900 dark:text-white">78% used</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;