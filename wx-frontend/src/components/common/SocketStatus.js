import React from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import useSocket from '../../hooks/useSocket';

/**
 * Socket status component
 * @returns {JSX.Element} - Socket status component
 */
const SocketStatus = () => {
  const { isConnected, error, connect } = useSocket({ autoConnect: false });

  return (
    <div className="inline-flex items-center">
      {isConnected ? (
        <div className="flex items-center text-success-500 dark:text-success-400">
          <FaWifi className="h-4 w-4 mr-1" />
          <span className="text-xs">Connected</span>
        </div>
      ) : (
        <div className="flex items-center text-warning-500 dark:text-warning-400">
          <FaExclamationTriangle className="h-4 w-4 mr-1" />
          <span className="text-xs">Disconnected</span>
          <button
            onClick={connect}
            className="ml-2 text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Reconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default SocketStatus;
