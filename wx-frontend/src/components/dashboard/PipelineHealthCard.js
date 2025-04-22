import React from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaPauseCircle } from 'react-icons/fa';

/**
 * Pipeline health card component for dashboard
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Pipeline health card component
 */
const PipelineHealthCard = ({ data }) => {
  // Health status configurations with icons and colors
  const healthConfig = {
    healthy: {
      icon: <FaCheckCircle className="h-5 w-5" />,
      bgClass: 'bg-success-100 dark:bg-success-900',
      textClass: 'text-success-600 dark:text-success-400',
      label: 'Healthy'
    },
    warning: {
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      bgClass: 'bg-warning-100 dark:bg-warning-900',
      textClass: 'text-warning-600 dark:text-warning-400',
      label: 'Warning'
    },
    critical: {
      icon: <FaExclamationCircle className="h-5 w-5" />,
      bgClass: 'bg-danger-100 dark:bg-danger-900',
      textClass: 'text-danger-600 dark:text-danger-400',
      label: 'Critical'
    },
    inactive: {
      icon: <FaPauseCircle className="h-5 w-5" />,
      bgClass: 'bg-gray-100 dark:bg-gray-800',
      textClass: 'text-gray-600 dark:text-gray-400',
      label: 'Inactive'
    }
  };

  const total = data.healthy + data.warning + data.critical + data.inactive;

  return (
    <div className="card p-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pipeline Health</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Total Pipelines</div>
        <div className="text-xl font-semibold text-gray-900 dark:text-white">{total}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Healthy */}
        <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className={`h-10 w-10 rounded-full ${healthConfig.healthy.bgClass} ${healthConfig.healthy.textClass} flex items-center justify-center mb-2`}>
            {healthConfig.healthy.icon}
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data.healthy}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{healthConfig.healthy.label}</div>
        </div>
        
        {/* Warning */}
        <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className={`h-10 w-10 rounded-full ${healthConfig.warning.bgClass} ${healthConfig.warning.textClass} flex items-center justify-center mb-2`}>
            {healthConfig.warning.icon}
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data.warning}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{healthConfig.warning.label}</div>
        </div>
        
        {/* Critical */}
        <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className={`h-10 w-10 rounded-full ${healthConfig.critical.bgClass} ${healthConfig.critical.textClass} flex items-center justify-center mb-2`}>
            {healthConfig.critical.icon}
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data.critical}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{healthConfig.critical.label}</div>
        </div>
        
        {/* Inactive */}
        <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className={`h-10 w-10 rounded-full ${healthConfig.inactive.bgClass} ${healthConfig.inactive.textClass} flex items-center justify-center mb-2`}>
            {healthConfig.inactive.icon}
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data.inactive}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{healthConfig.inactive.label}</div>
        </div>
      </div>
      
      {/* Health distribution */}
      <div className="mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Health Distribution</div>
        <div className="flex h-2 rounded-full overflow-hidden">
          <div 
            className="bg-success-500" 
            style={{ width: `${(data.healthy / total) * 100}%` }}
          ></div>
          <div 
            className="bg-warning-500" 
            style={{ width: `${(data.warning / total) * 100}%` }}
          ></div>
          <div 
            className="bg-danger-500" 
            style={{ width: `${(data.critical / total) * 100}%` }}
          ></div>
          <div 
            className="bg-gray-500" 
            style={{ width: `${(data.inactive / total) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

PipelineHealthCard.propTypes = {
  data: PropTypes.shape({
    healthy: PropTypes.number.isRequired,
    warning: PropTypes.number.isRequired,
    critical: PropTypes.number.isRequired,
    inactive: PropTypes.number.isRequired
  }).isRequired
};

export default PipelineHealthCard;
