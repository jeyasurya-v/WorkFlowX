import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaBell, 
  FaUser, 
  FaCog,
  FaExclamationTriangle
} from 'react-icons/fa';

/**
 * Notification item component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Notification item component
 */
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-success-500" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-danger-500" />;
      case 'warning':
        return <FaExclamationTriangle className="h-5 w-5 text-warning-500" />;
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-info-500" />;
      case 'user':
        return <FaUser className="h-5 w-5 text-primary-500" />;
      case 'system':
        return <FaCog className="h-5 w-5 text-gray-500" />;
      default:
        return <FaBell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationLink = () => {
    if (!notification.link) return null;

    switch (notification.category) {
      case 'build':
        return `/builds/${notification.link}`;
      case 'pipeline':
        return `/pipelines/${notification.link}`;
      case 'user':
        return `/profile`;
      case 'organization':
        return `/organizations/${notification.link}`;
      case 'settings':
        return `/settings`;
      default:
        return notification.link;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
        notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {notification.title}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {notification.message}
          </div>
          {getNotificationLink() && (
            <div className="mt-2">
              <Link 
                to={getNotificationLink()} 
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View Details
              </Link>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>{formatTime(notification.timestamp)}</span>
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'user', 'system']).isRequired,
    category: PropTypes.oneOf(['build', 'pipeline', 'user', 'organization', 'settings', 'other']),
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    link: PropTypes.string
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired
};

export default NotificationItem;
