import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Cyberpunk-inspired button component with glitch effects
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Cyber button component
 */
const CyberButton = ({ 
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
  glitchEffect = true,
  ...rest 
}) => {
  // Base styles
  const baseClasses = 'relative inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300 ease-in-out focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden';
  
  // Size configurations
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-3.5 text-lg',
    xl: 'px-7 py-4 text-xl'
  };

  // Variant configurations
  const variantClasses = {
    primary: 'bg-primary-600 text-white border border-primary-500 hover:bg-primary-700',
    accent: 'bg-accent-600 text-white border border-accent-500 hover:bg-accent-700',
    tertiary: 'bg-tertiary-600 text-white border border-tertiary-500 hover:bg-tertiary-700',
    cyber: 'bg-black text-tertiary-400 border border-tertiary-500 hover:text-tertiary-300',
    neon: 'bg-black text-primary-400 border border-primary-500 hover:text-primary-300',
    ghost: 'bg-transparent text-white border border-gray-700 hover:bg-gray-800/50'
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
      boxShadow: `0 0 15px 2px ${variant === 'primary' ? 'rgba(20, 184, 166, 0.7)' : 
        variant === 'accent' ? 'rgba(168, 85, 247, 0.7)' : 
        variant === 'tertiary' ? 'rgba(6, 182, 212, 0.7)' : 
        variant === 'cyber' ? 'rgba(34, 211, 238, 0.7)' : 
        variant === 'neon' ? 'rgba(45, 212, 191, 0.7)' : 'rgba(255, 255, 255, 0.3)'}`,
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: 0.98,
      boxShadow: `0 0 5px 1px ${variant === 'primary' ? 'rgba(20, 184, 166, 0.5)' : 
        variant === 'accent' ? 'rgba(168, 85, 247, 0.5)' : 
        variant === 'tertiary' ? 'rgba(6, 182, 212, 0.5)' : 
        variant === 'cyber' ? 'rgba(34, 211, 238, 0.5)' : 
        variant === 'neon' ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
    }
  };

  // Glitch effect animation
  const glitchVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: [0, 1, 0.5, 1, 0, 0.5, 0],
      x: [0, -5, 5, -3, 3, 0],
      transition: {
        opacity: { repeat: Infinity, duration: 2, repeatType: "loop" },
        x: { repeat: Infinity, duration: 2, repeatType: "loop" }
      }
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
      {/* Glitch effect overlay */}
      {glitchEffect && !disabled && (
        <motion.span 
          className="absolute inset-0 bg-gradient-to-r from-tertiary-500/20 to-accent-500/20 z-0"
          initial="initial"
          whileHover="hover"
          variants={glitchVariants}
        />
      )}
      
      {/* Border glow effect */}
      <span className="absolute inset-0 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 rounded-md bg-gradient-to-r from-tertiary-500 to-accent-500 blur-md" />
      </span>
      
      {/* Content with icon */}
      <span className="relative flex items-center justify-center z-10">
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </span>
      
      {/* Bottom edge highlight */}
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-tertiary-500 to-accent-500" />
    </motion.button>
  );
};

CyberButton.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'accent', 'tertiary', 'cyber', 'neon', 'ghost']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  glitchEffect: PropTypes.bool
};

export default CyberButton;
