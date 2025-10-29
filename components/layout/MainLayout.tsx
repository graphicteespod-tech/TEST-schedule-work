
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { Page } from '../../App';

interface MainLayoutProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  children: React.ReactNode;
}

const pageTitles: Record<Page, string> = {
    DASHBOARD: 'My Schedule',
    DEPT_SCHEDULE: 'Department Schedule Management',
    SHIFT_MANAGEMENT: 'Shift Management',
    ORG_SCHEDULE: 'Organization-wide Schedule',
    USER_MANAGEMENT: 'User Management',
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentPage, setPage, children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} setPage={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle={pageTitles[currentPage]} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
