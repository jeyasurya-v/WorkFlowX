import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle, FaBell } from 'react-icons/fa';
import { markAllNotificationsAsRead } from '../../store/slices/notificationSlice';
import Button from '../common/Button';

const NotificationPanel = ({ isOpen, toggleNotifications }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'build_success':
        return <FaCheck className="h-5 w-5 text-success-500" />;
      case 'build_failure':
        return <FaExclamationTriangle className="h-5 w-5 text-danger-500" />;
      case 'pipeline_created':
      case 'member_added':
        return <FaInfoCircle className="h-5 w-5 text-primary-500" />;
      default:
        return <FaBell className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <>
      {/* Notification panel overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={toggleNotifications}
        ></div>
      )}

      {/* Notification panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h2>
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={toggleNotifications}
          >
            <span className="sr-only">Close panel</span>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-4">
          {notifications && notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li 
                  key={notification.id}
                  className={`p-3 rounded-md ${
                    notification.read 
                      ? 'bg-white dark:bg-gray-800' 
                      : 'bg-primary-50 dark:bg-primary-900/20'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.message}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>{formatTime(notification.createdAt)}</span>
                        {notification.buildId && (
                          <Link 
                            to={`/builds/${notification.buildId}`}
                            className="text-primary-600 dark:text-primary-400 hover:underline"
                            onClick={toggleNotifications}
                          >
                            View Build
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FaBell className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Panel footer */}
        {notifications && notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
