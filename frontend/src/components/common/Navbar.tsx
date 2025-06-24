import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, User, Moon, Sun, Code2, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const mobileNav = [
    ...(user ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
    { name: 'Online Compiler', href: '/compiler' },
    { name: 'Problems', href: '/problems' },
    { name: 'Contests', href: '/contests' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-muted)] dark:border-[var(--color-muted)] px-4 lg:px-6 py-3 shadow-md h-16 flex items-center" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
      <div className="flex items-center justify-between w-full h-full">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <Link to="/" className="flex items-center space-x-2 font-space-grotesk">
            <img
              src="/Logo.png"
              alt="VersionSolve Logo"
              className='mx-2'
              style={{ width: '3rem' }}
            />
          </Link>
          <div className="relative hidden md:block font-space-grotesk">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              className="pl-10 pr-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          <button
            onClick={toggleTheme}
            className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {theme === 'light' ? <Moon className="h-5 w-5 sm:h-6 sm:w-6" /> : <Sun className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
          {user && (
            <button className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Rating: {user.rating}</div>
              </div>
              <div className="relative">
                <button className="flex items-center space-x-1 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
          <div className="lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-4 top-14 w-56 bg-[var(--color-surface)] shadow-lg rounded-lg border border-[var(--color-muted)] z-50 animate-fade-in">
                <nav className="flex flex-col divide-y divide-[var(--color-muted)]">
                  {mobileNav.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-4 text-base font-medium hover:bg-[var(--color-muted)] transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;