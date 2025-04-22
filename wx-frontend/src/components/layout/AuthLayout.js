import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'dark' : ''}`}>
      <div className="max-w-md w-full space-y-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
