import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Neumorphic input component with animations
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Neumorphic input component
 */
const NeumorphicInput = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  className = '',
  icon,
  error,
  ...rest
}) => {
  // Animation variants
  const inputVariants = {
    focus: {
      boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -5px -5px 10px rgba(255, 255, 255, 0.1)',
      transition: { duration: 0.2 }
    },
    blur: {
      boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.1)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tertiary-500 dark:text-tertiary-400">
          {icon}
        </div>
      )}
      
      <motion.input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        initial="blur"
        whileFocus="focus"
        variants={inputVariants}
        className={`
          w-full py-3 px-4 ${icon ? 'pl-10' : ''}
          bg-gray-800/40 backdrop-blur-md
          text-white placeholder-gray-400
          border-0 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-tertiary-500/50
          transition-all duration-300 ease-in-out
          ${error ? 'ring-2 ring-red-500' : ''}
          ${className}
        `}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

NeumorphicInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.node,
  error: PropTypes.string
};

export default NeumorphicInput;
