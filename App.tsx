
import React, { useEffect, useState } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DeptSchedulePage } from './pages/DeptSchedulePage';
import { ShiftManagementPage } from './pages/ShiftManagementPage';
import { OrgSchedulePage } from './pages/OrgSchedulePage';
import { UserManagementPage } from './pages/UserManagementPage';
import { Role } from './constants';

export type Page = 'DASHBOARD' | 'DEPT_SCHEDULE' | 'SHIFT_MANAGEMENT' | 'ORG_SCHEDULE' | 'USER_MANAGEMENT';

const App: React.FC = () => {
  const { user, session, loading, checkSession } = useAuthStore();
  const [currentPage, setPage] = useState<Page>('DASHBOARD');
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Reset to dashboard on role change to prevent invalid page access
  useEffect(() => {
    setPage('DASHBOARD');
  }, [user?.role]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }
  
  const renderPage = () => {
    switch(currentPage) {
        case 'DASHBOARD':
            return <DashboardPage />;
        case 'DEPT_SCHEDULE':
            return user?.role === Role.DEPT_ADMIN ? <DeptSchedulePage /> : <div>Access Denied</div>;
        case 'SHIFT_MANAGEMENT':
            return user?.role === Role.DEPT_ADMIN ? <ShiftManagementPage /> : <div>Access Denied</div>;
        case 'ORG_SCHEDULE':
            return user?.role === Role.LEADERSHIP ? <OrgSchedulePage /> : <div>Access Denied</div>;
        case 'USER_MANAGEMENT':
            return user?.role === Role.LEADERSHIP ? <UserManagementPage /> : <div>Access Denied</div>;
        default:
            return <DashboardPage />;
    }
  }

  return (
    <MainLayout currentPage={currentPage} setPage={setPage}>
      {renderPage()}
    </MainLayout>
  );
};

export default App;
