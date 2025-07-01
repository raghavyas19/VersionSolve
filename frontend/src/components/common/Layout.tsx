import React, { createContext, useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { LogOut, User as UserIcon, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import { adminVerify } from '../../utils/api';

// Sidebar visibility context
const SidebarVisibilityContext = createContext<{ hidden: boolean; setHidden: (v: boolean) => void }>({ hidden: false, setHidden: () => { } });
export const useSidebarVisibility = () => useContext(SidebarVisibilityContext);

// Editor visibility context
const EditorVisibilityContext = createContext<{ editorOpen: boolean; setEditorOpen: (v: boolean) => void }>({ editorOpen: false, setEditorOpen: () => { } });
export const useEditorVisibility = () => useContext(EditorVisibilityContext);

const Layout: React.FC = () => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const location = useLocation();
  const hideNavAndSidebar = location.pathname === '/admin/auth';
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/auth';

  React.useEffect(() => {
    if (isAdminRoute) {
      adminVerify().then(res => setAdmin(res.admin)).catch(() => setAdmin(null));
    } else {
      setAdmin(null);
    }
  }, [location.pathname, isAdminRoute]);

  return (
    <EditorVisibilityContext.Provider value={{ editorOpen, setEditorOpen }}>
      <SidebarVisibilityContext.Provider value={{ hidden: sidebarHidden, setHidden: setSidebarHidden }}>
        <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          {!editorOpen && !hideNavAndSidebar && (isAdminRoute ? <AdminNavbar admin={admin} /> : <Navbar />)}
          {/* Open sidebar button (floating) */}
          {sidebarHidden && !editorOpen && !hideNavAndSidebar && (
            <button
              className="fixed top-20 left-0 p-2 rounded-r-lg rounded-l-none bg-blue-500/20 hover:bg-blue-500/40 dark:bg-blue-400/20 dark:hover:bg-blue-400/40 z-50 shadow transition-colors"
              onClick={() => setSidebarHidden(false)}
              aria-label="Open sidebar"
            >
              <ChevronRight className="h-6 w-6 text-blue-700 dark:text-blue-200" />
            </button>
          )}
          <div className={editorOpen || hideNavAndSidebar ? '' : 'flex pt-16'}>
            {!sidebarHidden && !editorOpen && !hideNavAndSidebar && <Sidebar />}
            <main className={sidebarHidden || editorOpen || hideNavAndSidebar ? 'flex-1 p-6 md:px-12 transition-all duration-300' : 'flex-1 lg:ml-64 p-5 lg:px-8 transition-all duration-300'} style={{ background: 'var(--color-bg)' }}>
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarVisibilityContext.Provider>
    </EditorVisibilityContext.Provider>
  );
};

export default Layout;