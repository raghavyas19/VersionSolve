import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { adminLogout } from '../../utils/api';

interface AdminHeaderProps {
  admin: { name: string } | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ admin }) => {
  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {}
    window.location.href = '/admin/auth';
  };
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-50" style={{ minHeight: '60px' }}>
      <div className="flex items-center">
        <img src={import.meta.env.BASE_URL + 'Logo.png'} alt="Logo" className="h-8 w-auto" />
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{admin?.name}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminHeader; 