import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

/**
 * Error page component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Error page component
 */
const ErrorPage = ({ error, errorInfo, resetError }) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <FaExclamationTriangle className="h-16 w-16 text-danger-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We're sorry, but an error occurred while rendering this page.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Error Details
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>
                {error && error.toString()}
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Component Stack:</h4>
                <pre className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-64">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <div className="mt-5 flex justify-center space-x-4">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
              >
                <FaRedo className="mr-2 -ml-1 h-4 w-4" />
                Try Again
              </button>
              
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FaHome className="mr-2 -ml-1 h-4 w-4" />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If this issue persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

ErrorPage.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  resetError: PropTypes.func
};

export default ErrorPage;
