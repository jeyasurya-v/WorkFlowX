import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BuildStatusBadge from '../builds/BuildStatusBadge';

/**
 * Recent builds card component for dashboard
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Recent builds card component
 */
const RecentBuildsCard = ({ builds }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'In progress';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="overflow-hidden">
      {builds.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {builds.map((build) => (
            <div key={build.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildStatusBadge status={build.status} />
                  <div className="ml-3">
                    <Link 
                      to={`/builds/${build.id}`} 
                      className="text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {build.pipelineName}
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {build.branch} • {build.commit.substring(0, 7)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(build.startedAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDuration(build.duration)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No recent builds found.
        </div>
      )}
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-center">
        <Link 
          to="/pipelines" 
          className="text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View all builds
        </Link>
      </div>
    </div>
  );
};

RecentBuildsCard.propTypes = {
  builds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      pipelineId: PropTypes.string.isRequired,
      pipelineName: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      commit: PropTypes.string.isRequired,
      startedAt: PropTypes.instanceOf(Date).isRequired,
      duration: PropTypes.number
    })
  ).isRequired
};

export default RecentBuildsCard;
