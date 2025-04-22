import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Modern glass-morphism button component with animations
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Glass button component
 */
const GlassButton = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  className = '', 
  onClick,
  icon,
  iconPosition = 'left',
  ...rest 
}) => {
  // Base styles
  const baseClasses = 'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';
  
  // Size configurations
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl'
  };

  // Variant configurations
  const variantClasses = {
    primary: 'bg-primary-600/90 text-white hover:bg-primary-700/90 focus:ring-primary-500 backdrop-blur-sm',
    secondary: 'bg-secondary-600/90 text-white hover:bg-secondary-700/90 focus:ring-secondary-500 backdrop-blur-sm',
    success: 'bg-success-600/90 text-white hover:bg-success-700/90 focus:ring-success-500 backdrop-blur-sm',
    danger: 'bg-danger-600/90 text-white hover:bg-danger-700/90 focus:ring-danger-500 backdrop-blur-sm',
    warning: 'bg-warning-600/90 text-white hover:bg-warning-700/90 focus:ring-warning-500 backdrop-blur-sm',
    info: 'bg-info-600/90 text-white hover:bg-info-700/90 focus:ring-info-500 backdrop-blur-sm',
    light: 'bg-white/70 text-gray-900 hover:bg-white/80 focus:ring-gray-200 border border-gray-200 backdrop-blur-sm dark:bg-gray-800/70 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700/80',
    dark: 'bg-gray-900/90 text-white hover:bg-gray-800/90 focus:ring-gray-700 backdrop-blur-sm',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/30 backdrop-blur-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800/50 backdrop-blur-sm'
  };

  // Width configuration
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClasses}
    ${className}
  `;

  // Animation variants
  const buttonVariants = {
    hover: { 
      scale: 1.02,
      boxShadow: `0 10px 25px -5px rgba(var(--tw-shadow-color), 0.2), 0 8px 10px -6px rgba(var(--tw-shadow-color), 0.2)`,
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: 0.98,
      boxShadow: `0 4px 6px -1px rgba(var(--tw-shadow-color), 0.1), 0 2px 4px -1px rgba(var(--tw-shadow-color), 0.06)`,
    }
  };

  return (
    <motion.button
      type={type}
      className={buttonClasses.trim()}
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      variants={buttonVariants}
      {...rest}
    >
      {/* Glass effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-10"></span>
      </span>
      
      {/* Content with icon */}
      <span className="relative flex items-center justify-center">
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </span>
    </motion.button>
  );
};

GlassButton.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline', 'ghost']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right'])
};

export default GlassButton;
