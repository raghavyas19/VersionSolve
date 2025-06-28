import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Search, User, Moon, Sun, Code2, Menu, Home, Terminal, BookOpen, Trophy, Award, BarChart3, FileText, Users, Lock, Shield, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import clsx from 'clsx';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const location = useLocation();

  // Sidebar navigation arrays (copied from Sidebar.tsx)
  const navigation = [
    ...(user ? [{ name: 'Dashboard', href: '/dashboard', icon: Home }] : []),
    { name: 'Problems', href: '/dashboard/problems', icon: BookOpen },
    { name: 'Contests', href: '/dashboard/contests', icon: Trophy },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Award },
  ];
  const protectedNavigation = [
    { name: 'My Submissions', href: '/dashboard/mysubmissions', icon: Code2, requiresAuth: true },
    { name: 'Online Compiler', href: '/compiler', icon: Terminal },
  ];
  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Manage Problems', href: '/admin/problems', icon: FileText },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b px-4 lg:px-6 py-3 shadow-md" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <Link to={user ? "/" : "/"} className="flex items-center space-x-2 mr-2 md:mr-4">
            <img src={`${import.meta.env.BASE_URL}Logo.png`} alt="VersionSolve Logo" style={{ width: '6rem' }} />
          </Link>
          <div className="hidden md:block flex-1">
            <div className="mx-auto max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  style={{ minWidth: '180px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop right controls */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          {user && (
            <>
              <div className="flex items-center space-x-2 mr-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{user.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{user.rating}</span>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            </>
          )}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Link
                to="/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 lg:px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
        {/* Mobile user icon and hamburger */}
        <div className="flex items-center md:hidden space-x-2">
          {user && (
            <div className="relative">
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-label="User menu"
              >
                <User className="h-6 w-6" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg py-2 z-50 animate-fade-in-down">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 flex flex-col space-y-1 animate-fade-in-down">
          {/* Sidebar navigation items for mobile */}
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
                onClick={() => setMobileMenuOpen(false)}
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
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
          {/* Admin Panel Section */}
          <div className="pt-4 pb-2">
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
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
          {/* Guest Notice for mobile */}
          {!user && (
            <div className="pt-4 block">
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;