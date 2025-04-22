import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'medium', withText = false, className = '', linkTo = '/' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12',
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  const logoContent = (
    <>
      <div className={`${sizeClasses[size]} text-primary-600 dark:text-primary-400 ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {withText && (
        <span className={`ml-2 font-bold ${textSizeClasses[size]} text-gray-900 dark:text-white`}>
          PipelineRadar
        </span>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return <div className="flex items-center">{logoContent}</div>;
};

Logo.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  withText: PropTypes.bool,
  className: PropTypes.string,
  linkTo: PropTypes.string,
};

export default Logo;
