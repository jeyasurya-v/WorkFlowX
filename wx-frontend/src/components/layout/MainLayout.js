import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import NotificationPanel from '../notifications/NotificationPanel';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { darkMode } = useSelector((state) => state.theme);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <div className={`h-full ${darkMode ? 'dark-mode' : ''}`}>
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            toggleSidebar={toggleSidebar} 
            toggleNotifications={toggleNotifications}
          />

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
            <div className="max-w-7xl mx-auto fade-in">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Notification panel */}
        <NotificationPanel 
          isOpen={notificationsOpen} 
          toggleNotifications={toggleNotifications} 
        />
      </div>
    </div>
  );
};

export default MainLayout;
