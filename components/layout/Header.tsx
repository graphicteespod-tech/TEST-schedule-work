
import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/Button';

interface HeaderProps {
    pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        <div className="text-right">
            <p className="font-semibold text-gray-700">{user?.full_name}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
        </div>
        <Button onClick={logout} variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
};
