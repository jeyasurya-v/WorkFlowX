import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaEllipsisH } from 'react-icons/fa';
import BuildStatusBadge from './BuildStatusBadge';

/**
 * Build history table component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Build history table component
 */
const BuildHistoryTable = ({ builds }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Build
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Branch
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Commit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Started
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Triggered By
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {builds.map((build) => (
              <tr key={build.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/builds/${build.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                    #{build.id.slice(-3)}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BuildStatusBadge status={build.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {build.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                      {build.commit.substring(0, 7)}
                    </code>
                    {build.commitMessage && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {build.commitMessage}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(build.startedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDuration(build.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {build.triggeredBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <FaEllipsisH />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {builds.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No builds found for this pipeline.
          </p>
        </div>
      )}
    </div>
  );
};

BuildHistoryTable.propTypes = {
  builds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      commit: PropTypes.string.isRequired,
      commitMessage: PropTypes.string,
      startedAt: PropTypes.instanceOf(Date).isRequired,
      duration: PropTypes.number,
      triggeredBy: PropTypes.string.isRequired
    })
  ).isRequired
};

export default BuildHistoryTable;
