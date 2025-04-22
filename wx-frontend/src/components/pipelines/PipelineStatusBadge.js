import React from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes, FaSpinner, FaClock, FaBan } from 'react-icons/fa';

/**
 * Pipeline status badge component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Status badge component
 */
const PipelineStatusBadge = ({ status, size = 'md' }) => {
  // Define status configurations
  const statusConfig = {
    success: {
      icon: <FaCheck />,
      text: 'Success',
      bgClass: 'bg-success-100 dark:bg-success-900/20',
      textClass: 'text-success-800 dark:text-success-300',
      iconClass: 'text-success-500'
    },
    failed: {
      icon: <FaTimes />,
      text: 'Failed',
      bgClass: 'bg-danger-100 dark:bg-danger-900/20',
      textClass: 'text-danger-800 dark:text-danger-300',
      iconClass: 'text-danger-500'
    },
    running: {
      icon: <FaSpinner className="animate-spin" />,
      text: 'Running',
      bgClass: 'bg-primary-100 dark:bg-primary-900/20',
      textClass: 'text-primary-800 dark:text-primary-300',
      iconClass: 'text-primary-500'
    },
    pending: {
      icon: <FaClock />,
      text: 'Pending',
      bgClass: 'bg-warning-100 dark:bg-warning-900/20',
      textClass: 'text-warning-800 dark:text-warning-300',
      iconClass: 'text-warning-500'
    },
    canceled: {
      icon: <FaBan />,
      text: 'Canceled',
      bgClass: 'bg-gray-100 dark:bg-gray-900/20',
      textClass: 'text-gray-800 dark:text-gray-300',
      iconClass: 'text-gray-500'
    }
  };

  // Default to 'pending' if status is not recognized
  const config = statusConfig[status] || statusConfig.pending;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  return (
    <span className={`inline-flex items-center rounded-full ${config.bgClass} ${config.textClass} ${sizeClasses[size]}`}>
      <span className={`mr-1.5 ${config.iconClass}`}>{config.icon}</span>
      {config.text}
    </span>
  );
};

PipelineStatusBadge.propTypes = {
  status: PropTypes.oneOf(['success', 'failed', 'running', 'pending', 'canceled']).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default PipelineStatusBadge;
