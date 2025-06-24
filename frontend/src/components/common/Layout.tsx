import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Sidebar visibility context
const SidebarVisibilityContext = createContext<{ hidden: boolean; setHidden: (v: boolean) => void }>({ hidden: false, setHidden: () => {} });
export const useSidebarVisibility = () => useContext(SidebarVisibilityContext);

// Editor visibility context
const EditorVisibilityContext = createContext<{ editorOpen: boolean; setEditorOpen: (v: boolean) => void }>({ editorOpen: false, setEditorOpen: () => {} });
export const useEditorVisibility = () => useContext(EditorVisibilityContext);

const Layout: React.FC = () => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  return (
    <EditorVisibilityContext.Provider value={{ editorOpen, setEditorOpen }}>
      <SidebarVisibilityContext.Provider value={{ hidden: sidebarHidden, setHidden: setSidebarHidden }}>
        <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          {!editorOpen && <Navbar />}
          <div className={editorOpen ? '' : 'flex pt-16 min-h-[calc(100vh-4rem)]'}>
            {!sidebarHidden && !editorOpen && <Sidebar />}
            <main className={sidebarHidden || editorOpen ? 'flex-1 p-0 min-h-screen transition-all duration-300' : 'flex-1 lg:ml-64 p-4 lg:p-6 min-h-screen transition-all duration-300'} style={{ background: 'var(--color-bg)' }}>
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarVisibilityContext.Provider>
    </EditorVisibilityContext.Provider>
  );
};

export default Layout;