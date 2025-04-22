import React from 'react';
import PropTypes from 'prop-types';

/**
 * Shimmer effect component for creating loading placeholders
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Shimmer effect component
 */
const ShimmerEffect = ({ 
  type = 'rectangle', 
  width = 'full', 
  height = 'md', 
  rounded = 'md',
  className = ''
}) => {
  // Height configurations
  const heightConfig = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-16',
    xl: 'h-24',
    '2xl': 'h-32',
    '3xl': 'h-48',
    full: 'h-full'
  };

  // Width configurations
  const widthConfig = {
    xs: 'w-8',
    sm: 'w-16',
    md: 'w-32',
    lg: 'w-48',
    xl: 'w-64',
    '2xl': 'w-96',
    '3xl': 'w-[32rem]',
    full: 'w-full'
  };

  // Border radius configurations
  const roundedConfig = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  // Type-specific classes
  const typeClasses = {
    rectangle: '',
    circle: 'rounded-full',
    text: 'h-4',
    avatar: 'rounded-full h-10 w-10',
    button: 'h-10 rounded-md',
    card: 'rounded-lg'
  };

  // Combine all classes
  const shimmerClasses = `
    animate-shimmer
    bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800
    bg-[length:400%_100%]
    ${heightConfig[height]}
    ${widthConfig[width]}
    ${roundedConfig[rounded]}
    ${typeClasses[type]}
    ${className}
  `;

  return <div className={shimmerClasses.trim()}></div>;
};

ShimmerEffect.propTypes = {
  type: PropTypes.oneOf(['rectangle', 'circle', 'text', 'avatar', 'button', 'card']),
  width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']),
  height: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  className: PropTypes.string
};

export default ShimmerEffect;
