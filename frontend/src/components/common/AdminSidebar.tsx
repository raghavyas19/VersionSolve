import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Users, Settings, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Manage Problems', href: '/admin/problems', icon: FileText },
  { name: 'Manage Users', href: '/admin/user', icon: Users },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

const AdminSidebar: React.FC<{ hidden: boolean; setHidden: (v: boolean) => void }> = ({ hidden, setHidden }) => {
  const location = useLocation();
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
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar; 