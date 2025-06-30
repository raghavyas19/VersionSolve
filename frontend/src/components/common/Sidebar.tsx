import React, { useState, useContext } from 'react';
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
  Terminal,
  FileText,
  Shield,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';
import { useSidebarVisibility } from './Layout';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { hidden, setHidden } = useSidebarVisibility();

  const navigation = [
    ...(user ? [{ name: 'Dashboard', href: '/dashboard', icon: Home }] : []),
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

  // Remove adminSession logic
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="hidden lg:block fixed top-16 left-0 z-40 border-r transition-all duration-300 ease-in-out overflow-y-auto w-64 h-[calc(100vh-4rem)]" style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-muted)' }}>
      <div className="flex flex-col h-full">
        {/* Close button */}
        <button
          className="absolute top-4 right-0 p-2 rounded-l-lg bg-blue-500/20 hover:bg-blue-500/40 dark:bg-blue-400/20 dark:hover:bg-blue-400/40 transition-colors z-50 shadow"
          onClick={() => setHidden(true)}
          aria-label="Close sidebar"
        >
          <ChevronLeft className="h-6 w-6 text-blue-700 dark:text-blue-200" />
        </button>
        <nav className="flex-1 px-2 py-6 space-y-2 font-space-grotesk">
          {isAdmin ? (
            <>
              <div className="pt-6 pb-2 block">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-space-grotesk">
                  Admin Panel
                </h3>
              </div>
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              <div className="pt-6 pb-2 block">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-space-grotesk">
                  User Panel
                </h3>
              </div>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
              {protectedNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                if (!user) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed group"
                    >
                      <Lock className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3">{item.name}</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
              {/* Guest Notice */}
              {!user && (
                <div className="pt-6 block">
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
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;