/**
 * Loading Spinner Component
 * 
 * A flexible loading spinner that can be used inline or as a full-screen overlay.
 * Supports different sizes and custom styling.
 * 
 * @module components/common/LoadingSpinner
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the spinner (small, medium, large)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.fullScreen=false] - Whether to display as full-screen overlay
 * @param {string} [props.color='primary'] - Color variant (primary, secondary, success, warning, error)
 * @param {string} [props.label=''] - Optional loading text
 * @returns {JSX.Element} - Rendered component
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  className = '', 
  fullScreen = false,
  color = 'primary',
  label = ''
}) => {
  // Size variations
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  // Color variations
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  };

  // The spinner SVG
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${colorClasses[color]} ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {label && (
        <span className={`mt-2 text-sm font-medium ${colorClasses[color]}`} aria-live="polite">
          {label}
        </span>
      )}
    </div>
  );

  // Full-screen version with background overlay
  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50"
        role="alert"
        aria-busy="true"
        aria-label="Loading"
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
  label: PropTypes.string
};

export default LoadingSpinner;
