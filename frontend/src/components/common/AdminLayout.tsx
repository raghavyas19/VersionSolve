import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { adminVerify } from '../../utils/api';
import { ChevronRight } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    adminVerify().then(res => setAdmin(res.admin)).catch(() => setAdmin(null));
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <AdminHeader admin={admin} />
      {/* Open sidebar button (floating) */}
      {sidebarHidden && (
        <button
          className="fixed top-20 left-0 p-2 rounded-r-lg rounded-l-none bg-blue-500/20 hover:bg-blue-500/40 dark:bg-blue-400/20 dark:hover:bg-blue-400/40 z-50 shadow transition-colors"
          onClick={() => setSidebarHidden(false)}
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-6 w-6 text-blue-700 dark:text-blue-200" />
        </button>
      )}
      <div className="flex pt-16">
        {!sidebarHidden && <AdminSidebar hidden={sidebarHidden} setHidden={setSidebarHidden} />}
        <main className={sidebarHidden ? 'flex-1 p-6 md:px-12 transition-all duration-300' : 'flex-1 lg:ml-64 p-5 lg:px-8 transition-all duration-300'} style={{ background: 'var(--color-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 