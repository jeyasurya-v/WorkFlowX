import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Animated loading spinner component with various styles
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Animated loading spinner component
 */
const AnimatedLoadingSpinner = ({ size = 'md', variant = 'primary', text = '', fullScreen = false }) => {
  // Size configurations
  const sizeConfig = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // Color configurations
  const colorConfig = {
    primary: 'text-primary-500 dark:text-primary-400',
    secondary: 'text-secondary-500 dark:text-secondary-400',
    success: 'text-success-500 dark:text-success-400',
    danger: 'text-danger-500 dark:text-danger-400',
    warning: 'text-warning-500 dark:text-warning-400',
    info: 'text-info-500 dark:text-info-400',
    light: 'text-gray-300 dark:text-gray-600',
    dark: 'text-gray-800 dark:text-gray-300'
  };

  // Animation variants
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 z-50' 
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Outer spinning circle */}
        <motion.div
          className={`${sizeConfig[size]} rounded-full border-4 border-t-transparent border-b-transparent ${colorConfig[variant]}`}
          variants={spinnerVariants}
          animate="animate"
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center`}
          variants={pulseVariants}
          animate="animate"
        >
          <div className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-8 w-8'} rounded-full ${colorConfig[variant]}`} />
        </motion.div>
      </div>
      
      {text && (
        <motion.p 
          className={`mt-4 text-sm font-medium ${colorConfig[variant]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

AnimatedLoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool
};

export default AnimatedLoadingSpinner;
