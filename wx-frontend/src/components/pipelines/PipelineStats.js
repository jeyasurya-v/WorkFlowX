import React from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes, FaClock, FaBolt } from 'react-icons/fa';

/**
 * Pipeline statistics component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Pipeline stats component
 */
const PipelineStats = ({ pipeline }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400">
            <FaCheck className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pipeline.successRate}%</p>
          </div>
        </div>
      </div>
      
      <div className="card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
            <FaBolt className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Duration</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatDuration(pipeline.avgDuration)}</p>
          </div>
        </div>
      </div>
      
      <div className="card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-info-100 dark:bg-info-900 text-info-600 dark:text-info-400">
            <FaClock className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Run</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatDate(pipeline.lastRun)}</p>
          </div>
        </div>
      </div>
      
      <div className="card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-warning-100 dark:bg-warning-900 text-warning-600 dark:text-warning-400">
            <FaTimes className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Builds</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pipeline.totalBuilds}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

PipelineStats.propTypes = {
  pipeline: PropTypes.shape({
    successRate: PropTypes.number.isRequired,
    avgDuration: PropTypes.number.isRequired,
    lastRun: PropTypes.instanceOf(Date).isRequired,
    totalBuilds: PropTypes.number.isRequired
  }).isRequired
};

export default PipelineStats;
