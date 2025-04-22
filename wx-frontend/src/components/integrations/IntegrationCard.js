import React from 'react';
import PropTypes from 'prop-types';
import { FaGithub, FaGitlab, FaJenkins, FaCircle, FaPlug, FaCheck, FaTimes } from 'react-icons/fa';
import { SiCircleci } from 'react-icons/si';

/**
 * Integration card component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Integration card component
 */
const IntegrationCard = ({ integration, onConnect, onDisconnect, onConfigure }) => {
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'github':
        return <FaGithub className="h-6 w-6" />;
      case 'gitlab':
        return <FaGitlab className="h-6 w-6" />;
      case 'jenkins':
        return <FaJenkins className="h-6 w-6" />;
      case 'circleci':
        return <SiCircleci className="h-6 w-6" />;
      default:
        return <FaPlug className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'connected') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
          <FaCheck className="mr-1 h-3 w-3" />
          Connected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <FaTimes className="mr-1 h-3 w-3" />
          Disconnected
        </span>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md ${
            integration.status === 'connected' 
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {getProviderIcon(integration.provider)}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{integration.name}</h3>
            <div className="mt-1 flex items-center">
              {getStatusBadge(integration.status)}
              {integration.status === 'connected' && integration.lastSyncTime && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  Last synced: {new Date(integration.lastSyncTime).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {integration.description}
          </p>
        </div>
        
        {integration.status === 'connected' && integration.stats && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {integration.stats.repositories}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Repositories</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {integration.stats.pipelines}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pipelines</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {integration.stats.builds}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Builds</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 text-right">
        {integration.status === 'connected' ? (
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => onConfigure(integration.id)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Configure
            </button>
            <button
              type="button"
              onClick={() => onDisconnect(integration.id)}
              className="inline-flex items-center px-3 py-1.5 border border-danger-300 dark:border-danger-600 text-xs font-medium rounded text-danger-700 dark:text-danger-200 bg-white dark:bg-gray-800 hover:bg-danger-50 dark:hover:bg-gray-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onConnect(integration.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

IntegrationCard.propTypes = {
  integration: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    provider: PropTypes.oneOf(['github', 'gitlab', 'jenkins', 'circleci', 'custom']).isRequired,
    status: PropTypes.oneOf(['connected', 'disconnected']).isRequired,
    description: PropTypes.string.isRequired,
    lastSyncTime: PropTypes.string,
    stats: PropTypes.shape({
      repositories: PropTypes.number,
      pipelines: PropTypes.number,
      builds: PropTypes.number
    })
  }).isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  onConfigure: PropTypes.func.isRequired
};

export default IntegrationCard;
