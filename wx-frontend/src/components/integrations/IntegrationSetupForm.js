import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaGithub, FaGitlab, FaJenkins, FaInfoCircle, FaKey } from 'react-icons/fa';
import { SiCircleci } from 'react-icons/si';

/**
 * Integration setup form component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Integration setup form component
 */
const IntegrationSetupForm = ({ 
  provider, 
  initialValues = {}, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const [formValues, setFormValues] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    username: '',
    password: '',
    webhookSecret: '',
    ...initialValues
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Set default base URL based on provider
    if (!formValues.baseUrl) {
      switch (provider) {
        case 'github':
          setFormValues(prev => ({ ...prev, baseUrl: 'https://api.github.com' }));
          break;
        case 'gitlab':
          setFormValues(prev => ({ ...prev, baseUrl: 'https://gitlab.com/api/v4' }));
          break;
        case 'circleci':
          setFormValues(prev => ({ ...prev, baseUrl: 'https://circleci.com/api/v2' }));
          break;
        default:
          break;
      }
    }
  }, [provider, formValues.baseUrl]);
  
  const getProviderIcon = () => {
    switch (provider) {
      case 'github':
        return <FaGithub className="h-6 w-6" />;
      case 'gitlab':
        return <FaGitlab className="h-6 w-6" />;
      case 'jenkins':
        return <FaJenkins className="h-6 w-6" />;
      case 'circleci':
        return <SiCircleci className="h-6 w-6" />;
      default:
        return null;
    }
  };
  
  const getProviderName = () => {
    switch (provider) {
      case 'github':
        return 'GitHub';
      case 'gitlab':
        return 'GitLab';
      case 'jenkins':
        return 'Jenkins';
      case 'circleci':
        return 'CircleCI';
      default:
        return 'Custom';
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formValues.baseUrl) {
      newErrors.baseUrl = 'Base URL is required';
    } else if (!/^https?:\/\//.test(formValues.baseUrl)) {
      newErrors.baseUrl = 'Base URL must start with http:// or https://';
    }
    
    // API key or username/password is required for most providers
    if (provider !== 'github' && !formValues.apiKey && (!formValues.username || !formValues.password)) {
      newErrors.apiKey = 'Either API key or username/password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
            {getProviderIcon()}
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
            {initialValues.id ? 'Edit' : 'Connect'} {getProviderName()}
          </h3>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Integration Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name 
                  ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500 dark:border-danger-700' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }`}
              placeholder={`My ${getProviderName()}`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.name}</p>
            )}
          </div>
          
          {/* Base URL */}
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Base URL
            </label>
            <input
              type="text"
              id="baseUrl"
              name="baseUrl"
              value={formValues.baseUrl}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.baseUrl 
                  ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500 dark:border-danger-700' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }`}
              placeholder="https://api.example.com"
            />
            {errors.baseUrl && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.baseUrl}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {provider === 'jenkins' && 'Example: http://jenkins.example.com:8080'}
              {provider === 'custom' && 'The base URL of your CI/CD service API'}
            </p>
          </div>
          
          {/* Authentication Section */}
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Authentication</h4>
            
            {/* API Key */}
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key / Token
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formValues.apiKey}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.apiKey 
                      ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500 dark:border-danger-700' 
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  }`}
                  placeholder="Enter API key or token"
                />
              </div>
              {errors.apiKey && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.apiKey}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-start">
                <FaInfoCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  {provider === 'github' && 'Create a personal access token with repo and workflow scopes'}
                  {provider === 'gitlab' && 'Create a personal access token with api scope'}
                  {provider === 'circleci' && 'Use your CircleCI API token'}
                  {provider === 'jenkins' && 'Use an API token or username/password below'}
                  {provider === 'custom' && 'API key or token for authentication'}
                </span>
              </p>
            </div>
            
            {/* Username/Password (for Jenkins or custom providers) */}
            {(provider === 'jenkins' || provider === 'custom') && (
              <>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formValues.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter password"
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Webhook Secret (for GitHub, GitLab) */}
          {(provider === 'github' || provider === 'gitlab') && (
            <div>
              <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Webhook Secret (Optional)
              </label>
              <input
                type="password"
                id="webhookSecret"
                name="webhookSecret"
                value={formValues.webhookSecret}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter webhook secret"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Used to verify webhook payloads. Leave empty to generate one automatically.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connecting...' : initialValues.id ? 'Update' : 'Connect'}
          </button>
        </div>
      </form>
    </div>
  );
};

IntegrationSetupForm.propTypes = {
  provider: PropTypes.oneOf(['github', 'gitlab', 'jenkins', 'circleci', 'custom']).isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    baseUrl: PropTypes.string,
    apiKey: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
    webhookSecret: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

IntegrationSetupForm.defaultProps = {
  initialValues: {},
  isSubmitting: false
};

export default IntegrationSetupForm;
