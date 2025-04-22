import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSave, FaBell, FaEnvelope, FaMobile, FaSlack } from 'react-icons/fa';

/**
 * Notification preferences component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Notification preferences component
 */
const NotificationPreferences = ({ preferences, onSave, isLoading }) => {
  const [settings, setSettings] = useState(preferences);

  const handleChange = (e) => {
    const { name, checked, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          <FaBell className="inline-block mr-2" />
          Notification Preferences
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Configure how and when you receive notifications.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Notification Channels</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="emailEnabled"
                      name="emailEnabled"
                      type="checkbox"
                      checked={settings.emailEnabled}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="emailEnabled" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <FaEnvelope className="mr-2" /> Email Notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Receive notifications via email.</p>
                    
                    {settings.emailEnabled && (
                      <div className="mt-2">
                        <label htmlFor="emailAddress" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="emailAddress"
                          id="emailAddress"
                          value={settings.emailAddress}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="pushEnabled"
                      name="pushEnabled"
                      type="checkbox"
                      checked={settings.pushEnabled}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="pushEnabled" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <FaMobile className="mr-2" /> Push Notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Receive browser push notifications.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="slackEnabled"
                      name="slackEnabled"
                      type="checkbox"
                      checked={settings.slackEnabled}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="slackEnabled" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <FaSlack className="mr-2" /> Slack Notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Receive notifications in Slack.</p>
                    
                    {settings.slackEnabled && (
                      <div className="mt-2">
                        <label htmlFor="slackWebhook" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Slack Webhook URL
                        </label>
                        <input
                          type="text"
                          name="slackWebhook"
                          id="slackWebhook"
                          value={settings.slackWebhook}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notification Events */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Notification Events</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="buildSuccess"
                      name="buildSuccess"
                      type="checkbox"
                      checked={settings.buildSuccess}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="buildSuccess" className="font-medium text-gray-700 dark:text-gray-300">
                      Build Success
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Notify when builds complete successfully.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="buildFailure"
                      name="buildFailure"
                      type="checkbox"
                      checked={settings.buildFailure}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="buildFailure" className="font-medium text-gray-700 dark:text-gray-300">
                      Build Failure
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Notify when builds fail.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="buildStarted"
                      name="buildStarted"
                      type="checkbox"
                      checked={settings.buildStarted}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="buildStarted" className="font-medium text-gray-700 dark:text-gray-300">
                      Build Started
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Notify when builds start running.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="pipelineUpdated"
                      name="pipelineUpdated"
                      type="checkbox"
                      checked={settings.pipelineUpdated}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="pipelineUpdated" className="font-medium text-gray-700 dark:text-gray-300">
                      Pipeline Updates
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Notify when pipelines are updated or modified.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="teamEvents"
                      name="teamEvents"
                      type="checkbox"
                      checked={settings.teamEvents}
                      onChange={handleChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="teamEvents" className="font-medium text-gray-700 dark:text-gray-300">
                      Team Events
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Notify about team member actions and changes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Digest Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Digest Settings</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="digestFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Summary Digest Frequency
                  </label>
                  <select
                    id="digestFrequency"
                    name="digestFrequency"
                    value={settings.digestFrequency}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
            {!isLoading && <FaSave className="ml-2 -mr-1 h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};

NotificationPreferences.propTypes = {
  preferences: PropTypes.shape({
    emailEnabled: PropTypes.bool.isRequired,
    emailAddress: PropTypes.string,
    pushEnabled: PropTypes.bool.isRequired,
    slackEnabled: PropTypes.bool.isRequired,
    slackWebhook: PropTypes.string,
    buildSuccess: PropTypes.bool.isRequired,
    buildFailure: PropTypes.bool.isRequired,
    buildStarted: PropTypes.bool.isRequired,
    pipelineUpdated: PropTypes.bool.isRequired,
    teamEvents: PropTypes.bool.isRequired,
    digestFrequency: PropTypes.oneOf(['never', 'daily', 'weekly']).isRequired
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

NotificationPreferences.defaultProps = {
  isLoading: false
};

export default NotificationPreferences;
