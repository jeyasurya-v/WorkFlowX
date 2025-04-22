import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorPage from './ErrorPage';

/**
 * Error boundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Here you could send the error to your analytics service
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback(error, errorInfo);
      }
      
      return <ErrorPage error={error} errorInfo={errorInfo} />;
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func
};

export default ErrorBoundary;
