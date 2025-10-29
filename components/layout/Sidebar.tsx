
import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Role } from '../../constants';
import type { Page } from '../../App';

interface SidebarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    setPage: (page: Page) => void;
    children: React.ReactNode;
}> = ({ page, currentPage, setPage, children }) => {
    const isActive = currentPage === page;
    return (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); setPage(page); }}
            className={`block px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {children}
        </a>
    );
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage }) => {
  const { user } = useAuthStore();

  return (
    <aside className="w-64 bg-white h-screen p-4 shadow-lg flex flex-col">
      <div className="text-2xl font-bold text-primary-600 mb-8">
        Scheduler
      </div>
      <nav className="flex-grow space-y-2">
        <NavLink page="DASHBOARD" currentPage={currentPage} setPage={setPage}>My Schedule</NavLink>
        
        {user?.role === Role.DEPT_ADMIN && (
          <>
            <NavLink page="DEPT_SCHEDULE" currentPage={currentPage} setPage={setPage}>Department Schedule</NavLink>
            <NavLink page="SHIFT_MANAGEMENT" currentPage={currentPage} setPage={setPage}>Shift Management</NavLink>
          </>
        )}
        
        {user?.role === Role.LEADERSHIP && (
          <>
            <NavLink page="ORG_SCHEDULE" currentPage={currentPage} setPage={setPage}>Organization Schedule</NavLink>
            <NavLink page="USER_MANAGEMENT" currentPage={currentPage} setPage={setPage}>User Management</NavLink>
          </>
        )}
      </nav>
      <div className="text-xs text-gray-400 mt-4">
          &copy; {new Date().getFullYear()} Workforce Scheduler
      </div>
    </aside>
  );
};
