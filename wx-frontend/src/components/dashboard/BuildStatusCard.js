import React from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes, FaSpinner, FaClock, FaBan } from 'react-icons/fa';

/**
 * Build status card component for dashboard
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Build status card component
 */
const BuildStatusCard = ({ data }) => {
  // Status configurations with icons and colors
  const statusConfig = {
    success: {
      icon: <FaCheck className="h-5 w-5" />,
      bgClass: 'bg-success-100 dark:bg-success-900',
      textClass: 'text-success-600 dark:text-success-400'
    },
    failed: {
      icon: <FaTimes className="h-5 w-5" />,
      bgClass: 'bg-danger-100 dark:bg-danger-900',
      textClass: 'text-danger-600 dark:text-danger-400'
    },
    running: {
      icon: <FaSpinner className="h-5 w-5 animate-spin" />,
      bgClass: 'bg-primary-100 dark:bg-primary-900',
      textClass: 'text-primary-600 dark:text-primary-400'
    },
    pending: {
      icon: <FaClock className="h-5 w-5" />,
      bgClass: 'bg-warning-100 dark:bg-warning-900',
      textClass: 'text-warning-600 dark:text-warning-400'
    },
    canceled: {
      icon: <FaBan className="h-5 w-5" />,
      bgClass: 'bg-gray-100 dark:bg-gray-800',
      textClass: 'text-gray-600 dark:text-gray-400'
    }
  };

  return (
    <div className="card p-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Build Status</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Total Builds</div>
        <div className="text-xl font-semibold text-gray-900 dark:text-white">{data.total}</div>
      </div>
      
      <div className="space-y-4">
        {/* Success */}
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${statusConfig.success.bgClass} ${statusConfig.success.textClass} flex items-center justify-center`}>
            {statusConfig.success.icon}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Success</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{data.success}</div>
            </div>
            <div className="mt-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full" 
                  style={{ width: `${(data.success / data.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Failed */}
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${statusConfig.failed.bgClass} ${statusConfig.failed.textClass} flex items-center justify-center`}>
            {statusConfig.failed.icon}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Failed</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{data.failed}</div>
            </div>
            <div className="mt-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-danger-500 h-2 rounded-full" 
                  style={{ width: `${(data.failed / data.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Running */}
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${statusConfig.running.bgClass} ${statusConfig.running.textClass} flex items-center justify-center`}>
            {statusConfig.running.icon}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Running</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{data.running}</div>
            </div>
            <div className="mt-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${(data.running / data.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending */}
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${statusConfig.pending.bgClass} ${statusConfig.pending.textClass} flex items-center justify-center`}>
            {statusConfig.pending.icon}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Pending</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{data.pending}</div>
            </div>
            <div className="mt-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-warning-500 h-2 rounded-full" 
                  style={{ width: `${(data.pending / data.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Canceled */}
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${statusConfig.canceled.bgClass} ${statusConfig.canceled.textClass} flex items-center justify-center`}>
            {statusConfig.canceled.icon}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Canceled</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{data.canceled}</div>
            </div>
            <div className="mt-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(data.canceled / data.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BuildStatusCard.propTypes = {
  data: PropTypes.shape({
    total: PropTypes.number.isRequired,
    success: PropTypes.number.isRequired,
    failed: PropTypes.number.isRequired,
    running: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
    canceled: PropTypes.number.isRequired
  }).isRequired
};

export default BuildStatusCard;
