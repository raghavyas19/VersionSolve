import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Code, 
  Trophy, 
  BarChart3, 
  Users, 
  Settings,
  Award,
  Clock,
  Terminal,
  FileText,
  Shield,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigation = [
    ...(user ? [{ name: 'Dashboard', href: '/', icon: Home }] : []),
    { name: 'Online Compiler', href: '/compiler', icon: Terminal },
    { name: 'Problems', href: '/problems', icon: BookOpen },
    { name: 'Contests', href: '/contests', icon: Trophy },
    { name: 'Leaderboard', href: '/leaderboard', icon: Award },
  ];

  const protectedNavigation = [
    { name: 'My Submissions', href: '/submissions', icon: Code, requiresAuth: true },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Manage Problems', href: '/admin/problems', icon: FileText },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeSidebar = () => {
    setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16 transition-all duration-300 ease-in-out',
        // Desktop: always show with icons only or full width
        'lg:w-64',
        // Mobile: collapsed (icons only) or expanded (full width)
        isExpanded ? 'w-64' : 'w-16',
        // Mobile expanded state
        'lg:translate-x-0',
        isExpanded ? 'translate-x-0' : 'translate-x-0'
      )}>
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
        >
          {isExpanded ? (
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex-1 px-2 py-6 space-y-2">
            {/* Main Navigation */}
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={clsx(
                    'ml-3 transition-opacity duration-300',
                    isExpanded || window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Protected Navigation */}
            {protectedNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              if (!user) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed group"
                    title={!isExpanded ? `${item.name} (Login Required)` : undefined}
                  >
                    <Lock className="h-5 w-5 flex-shrink-0" />
                    <span className={clsx(
                      'ml-3 transition-opacity duration-300',
                      isExpanded || window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                    )}>
                      {item.name}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={clsx(
                    'ml-3 transition-opacity duration-300',
                    isExpanded || window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Admin Navigation */}
            {user?.role === 'admin' && (
              <>
                <div className={clsx(
                  'pt-6 pb-2',
                  isExpanded || window.innerWidth >= 1024 ? 'block' : 'hidden lg:block'
                )}>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin Panel
                  </h3>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeSidebar}
                      className={clsx(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                        isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      )}
                      title={!isExpanded ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={clsx(
                        'ml-3 transition-opacity duration-300',
                        isExpanded || window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* Guest Notice */}
            {!user && (
              <div className={clsx(
                'pt-6',
                isExpanded || window.innerWidth >= 1024 ? 'block' : 'hidden lg:block'
              )}>
                <div className="px-3 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center mb-2">
                    <Shield className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Guest Mode</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    You're browsing as a guest. Sign in to submit solutions and track progress.
                  </p>
                  <Link
                    to="/login"
                    onClick={closeSidebar}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;