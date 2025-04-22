import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSave, FaBell, FaKey, FaPalette, FaUserCog } from 'react-icons/fa';
import Alert from '../../components/common/Alert';

/**
 * Settings page component
 * @returns {JSX.Element} - Settings page component
 */
const Settings = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    buildSuccess: false,
    buildFailure: true,
    buildStarted: false,
    dailyDigest: true,
    desktopNotifications: true
  });
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    density: 'comfortable',
    colorAccent: 'blue'
  });
  
  // API tokens
  const [apiTokens, setApiTokens] = useState([]);
  const [newTokenName, setNewTokenName] = useState('');
  
  useEffect(() => {
    // Initialize settings from user preferences
    if (user && user.preferences) {
      setGeneralSettings(prev => ({
        ...prev,
        ...user.preferences.general
      }));
      
      setNotificationSettings(prev => ({
        ...prev,
        ...user.preferences.notifications
      }));
      
      setAppearanceSettings(prev => ({
        ...prev,
        theme: theme || 'system'
      }));
    }
    
    // Load API tokens
    // This would typically be an API call
    setApiTokens([
      { id: '1', name: 'Development Token', lastUsed: '2025-04-15T10:30:00Z', createdAt: '2025-03-01T08:15:00Z' },
      { id: '2', name: 'CI Integration', lastUsed: '2025-04-20T14:22:00Z', createdAt: '2025-02-15T11:45:00Z' }
    ]);
  }, [user, theme]);
  
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'theme') {
      // Update theme in redux
      // dispatch(setTheme(value));
    }
  };
  
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user preferences
      // dispatch(updateUserPreferences({
      //   general: generalSettings,
      //   notifications: notificationSettings,
      //   appearance: appearanceSettings
      // }));
      
      setSaveSuccess(true);
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleCreateToken = async () => {
    if (!newTokenName.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new token to list
      const newToken = {
        id: Date.now().toString(),
        name: newTokenName,
        lastUsed: null,
        createdAt: new Date().toISOString()
      };
      
      setApiTokens(prev => [...prev, newToken]);
      setNewTokenName('');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to create token. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleDeleteToken = async (tokenId) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove token from list
      setApiTokens(prev => prev.filter(token => token.id !== tokenId));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to delete token. Please try again.');
      setIsLoading(false);
    }
  };
  
  const renderTabs = () => (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex -mb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'general'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaUserCog className="inline-block mr-2" />
          General
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'notifications'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaBell className="inline-block mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'appearance'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaPalette className="inline-block mr-2" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'api'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaKey className="inline-block mr-2" />
          API Tokens
        </button>
      </nav>
    </div>
  );
  
  const renderGeneralSettings = () => (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your basic preferences for PipelineRadar.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={generalSettings.language}
            onChange={handleGeneralChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            value={generalSettings.timezone}
            onChange={handleGeneralChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Format
          </label>
          <select
            id="dateFormat"
            name="dateFormat"
            value={generalSettings.dateFormat}
            onChange={handleGeneralChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  const renderNotificationSettings = () => (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure how and when you receive notifications.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="emailNotifications" className="font-medium text-gray-700 dark:text-gray-300">
              Email Notifications
            </label>
            <p className="text-gray-500 dark:text-gray-400">Receive notifications via email.</p>
          </div>
        </div>
        
        <div className="ml-6 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="buildSuccess"
                name="buildSuccess"
                type="checkbox"
                checked={notificationSettings.buildSuccess}
                onChange={handleNotificationChange}
                disabled={!notificationSettings.emailNotifications}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 disabled:opacity-50"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="buildSuccess" className="font-medium text-gray-700 dark:text-gray-300">
                Build Success
              </label>
              <p className="text-gray-500 dark:text-gray-400">Notify when builds succeed.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="buildFailure"
                name="buildFailure"
                type="checkbox"
                checked={notificationSettings.buildFailure}
                onChange={handleNotificationChange}
                disabled={!notificationSettings.emailNotifications}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 disabled:opacity-50"
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
                checked={notificationSettings.buildStarted}
                onChange={handleNotificationChange}
                disabled={!notificationSettings.emailNotifications}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 disabled:opacity-50"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="buildStarted" className="font-medium text-gray-700 dark:text-gray-300">
                Build Started
              </label>
              <p className="text-gray-500 dark:text-gray-400">Notify when builds start.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="dailyDigest"
                name="dailyDigest"
                type="checkbox"
                checked={notificationSettings.dailyDigest}
                onChange={handleNotificationChange}
                disabled={!notificationSettings.emailNotifications}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 disabled:opacity-50"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="dailyDigest" className="font-medium text-gray-700 dark:text-gray-300">
                Daily Digest
              </label>
              <p className="text-gray-500 dark:text-gray-400">Receive a daily summary of pipeline activity.</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="desktopNotifications"
                name="desktopNotifications"
                type="checkbox"
                checked={notificationSettings.desktopNotifications}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="desktopNotifications" className="font-medium text-gray-700 dark:text-gray-300">
                Desktop Notifications
              </label>
              <p className="text-gray-500 dark:text-gray-400">Receive browser notifications when the app is open.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderAppearanceSettings = () => (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance Settings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize the look and feel of PipelineRadar.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={appearanceSettings.theme}
            onChange={handleAppearanceChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="density" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Density
          </label>
          <select
            id="density"
            name="density"
            value={appearanceSettings.density}
            onChange={handleAppearanceChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="colorAccent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Accent Color
          </label>
          <select
            id="colorAccent"
            name="colorAccent"
            value={appearanceSettings.colorAccent}
            onChange={handleAppearanceChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="green">Green</option>
            <option value="orange">Orange</option>
            <option value="pink">Pink</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  const renderApiTokens = () => (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Tokens</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage API tokens for integrating with PipelineRadar.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Token name"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleCreateToken}
            disabled={!newTokenName.trim() || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
          >
            Create Token
          </button>
        </div>
        
        {apiTokens.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {apiTokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {token.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {token.lastUsed ? new Date(token.lastUsed).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteToken(token.id)}
                        className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No API tokens found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>
      
      {error && (
        <Alert 
          type="error" 
          title="Error" 
          message={error} 
          className="mb-4"
        />
      )}
      
      {saveSuccess && (
        <Alert 
          type="success" 
          title="Success" 
          message="Settings saved successfully" 
          className="mb-4"
        />
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {renderTabs()}
        
        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
          {activeTab === 'api' && renderApiTokens()}
        </div>
        
        {activeTab !== 'api' && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-right">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
              {!isLoading && <FaSave className="ml-2" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
