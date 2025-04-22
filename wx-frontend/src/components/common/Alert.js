import React from 'react';
import PropTypes from 'prop-types';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const Alert = ({
  type = 'info',
  message,
  title = '',
  onClose,
  className = '',
  dismissible = false,
}) => {
  const types = {
    info: {
      bgColor: 'bg-info-50 dark:bg-info-900/20',
      borderColor: 'border-info-400 dark:border-info-700',
      textColor: 'text-info-800 dark:text-info-300',
      icon: <FaInfoCircle className="h-5 w-5 text-info-400 dark:text-info-500" />,
    },
    success: {
      bgColor: 'bg-success-50 dark:bg-success-900/20',
      borderColor: 'border-success-400 dark:border-success-700',
      textColor: 'text-success-800 dark:text-success-300',
      icon: <FaCheckCircle className="h-5 w-5 text-success-400 dark:text-success-500" />,
    },
    warning: {
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
      borderColor: 'border-warning-400 dark:border-warning-700',
      textColor: 'text-warning-800 dark:text-warning-300',
      icon: <FaExclamationTriangle className="h-5 w-5 text-warning-400 dark:text-warning-500" />,
    },
    error: {
      bgColor: 'bg-danger-50 dark:bg-danger-900/20',
      borderColor: 'border-danger-400 dark:border-danger-700',
      textColor: 'text-danger-800 dark:text-danger-300',
      icon: <FaExclamationCircle className="h-5 w-5 text-danger-400 dark:text-danger-500" />,
    },
  };

  const { bgColor, borderColor, textColor, icon } = types[type];

  return (
    <div
      className={`rounded-md border-l-4 p-4 ${bgColor} ${borderColor} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          )}
          <div className={`text-sm ${textColor} ${title ? 'mt-2' : ''}`}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>
        </div>
        {dismissible && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-500`}
              >
                <span className="sr-only">Dismiss</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
  dismissible: PropTypes.bool,
};

export default Alert;
