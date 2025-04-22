import React from 'react';
import PropTypes from 'prop-types';

const TextInput = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  helpText = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <div className="mt-1">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${error ? 'border-danger-300 text-danger-900 focus:ring-danger-500 focus:border-danger-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          {...props}
        />
      </div>
      {helpText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

TextInput.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helpText: PropTypes.string,
};

export default TextInput;
