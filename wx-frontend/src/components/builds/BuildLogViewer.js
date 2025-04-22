import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaDownload, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Build log viewer component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Build log viewer component
 */
const BuildLogViewer = ({ logs, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLines, setExpandedLines] = useState({});
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(
        logs.filter((log) => 
          log.message.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [logs, searchTerm]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setAutoScroll(isAtBottom);
    }
  };

  const toggleLineExpansion = (lineId) => {
    setExpandedLines(prev => ({
      ...prev,
      [lineId]: !prev[lineId]
    }));
  };

  const downloadLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-logs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderLogLine = (log) => {
    const isExpanded = expandedLines[log.id];
    const shouldTruncate = log.message.length > 200 && !isExpanded;
    const displayMessage = shouldTruncate ? `${log.message.substring(0, 200)}...` : log.message;
    
    // Determine log level styling
    let levelClass = 'text-gray-700 dark:text-gray-300';
    if (log.level === 'error') {
      levelClass = 'text-danger-600 dark:text-danger-400 font-medium';
    } else if (log.level === 'warning') {
      levelClass = 'text-warning-600 dark:text-warning-400';
    } else if (log.level === 'info') {
      levelClass = 'text-info-600 dark:text-info-400';
    }
    
    return (
      <div 
        key={log.id} 
        className={`py-1 border-b border-gray-100 dark:border-gray-800 ${levelClass} font-mono text-sm`}
      >
        <div className="flex items-start">
          <span className="text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <span className="flex-1 break-words">
            {displayMessage}
            {shouldTruncate && (
              <button 
                onClick={() => toggleLineExpansion(log.id)}
                className="ml-2 text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center"
              >
                <FaChevronDown className="h-3 w-3 mr-1" />
                Show more
              </button>
            )}
            {isExpanded && (
              <button 
                onClick={() => toggleLineExpansion(log.id)}
                className="ml-2 text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center"
              >
                <FaChevronUp className="h-3 w-3 mr-1" />
                Show less
              </button>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Build Logs</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 py-2 text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={downloadLogs}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="h-96 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Loading logs...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-danger-600 dark:text-danger-400">
              Error loading logs: {error}
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No matching logs found' : 'No logs available'}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map(renderLogLine)}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'} 
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setAutoScroll(prev => !prev)}
            className={`text-xs px-2 py-1 rounded ${
              autoScroll 
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

BuildLogViewer.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      level: PropTypes.oneOf(['info', 'warning', 'error', 'debug']).isRequired
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

BuildLogViewer.defaultProps = {
  logs: [],
  isLoading: false,
  error: null
};

export default BuildLogViewer;
