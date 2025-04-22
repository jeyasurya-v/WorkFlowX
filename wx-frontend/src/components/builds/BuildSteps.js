import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes, FaSpinner, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Build steps component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Build steps component
 */
const BuildSteps = ({ steps }) => {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheck className="h-5 w-5 text-success-500" />;
      case 'failed':
        return <FaTimes className="h-5 w-5 text-danger-500" />;
      case 'running':
        return <FaSpinner className="h-5 w-5 text-primary-500 animate-spin" />;
      case 'pending':
        return <FaClock className="h-5 w-5 text-warning-500" />;
      default:
        return <FaClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success':
        return 'border-success-500';
      case 'failed':
        return 'border-danger-500';
      case 'running':
        return 'border-primary-500';
      case 'pending':
        return 'border-warning-500';
      default:
        return 'border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Build Steps</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {steps.map((step) => (
          <div key={step.id} className="p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleStep(step.id)}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 ${getStatusClass(step.status)}`}>
                  {getStatusIcon(step.status)}
                </div>
                <div className="ml-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">{step.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {step.startTime ? new Date(step.startTime).toLocaleTimeString() : 'Not started'}
                    {step.startTime && step.endTime && ' - '}
                    {step.endTime && new Date(step.endTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                  {formatDuration(step.duration)}
                </span>
                {expandedSteps[step.id] ? (
                  <FaChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <FaChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedSteps[step.id] && (
              <div className="mt-3 ml-11">
                {step.commands && step.commands.length > 0 ? (
                  <div className="space-y-2">
                    {step.commands.map((command, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded">
                          <span className="text-primary-600 dark:text-primary-400">$</span> {command.command}
                        </div>
                        {command.output && (
                          <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded overflow-x-auto text-xs text-gray-700 dark:text-gray-300">
                            {command.output}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No command details available
                  </div>
                )}
                
                {step.error && (
                  <div className="mt-2 p-3 bg-danger-50 dark:bg-danger-900 text-danger-700 dark:text-danger-300 rounded text-sm">
                    <div className="font-medium">Error:</div>
                    <div className="font-mono">{step.error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

BuildSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['success', 'failed', 'running', 'pending', 'skipped']).isRequired,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      duration: PropTypes.number,
      commands: PropTypes.arrayOf(
        PropTypes.shape({
          command: PropTypes.string.isRequired,
          output: PropTypes.string
        })
      ),
      error: PropTypes.string
    })
  ).isRequired
};

BuildSteps.defaultProps = {
  steps: []
};

export default BuildSteps;
