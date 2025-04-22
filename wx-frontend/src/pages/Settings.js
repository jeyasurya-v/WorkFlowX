import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDarkMode } from '../store/slices/themeSlice';
import Alert from '../components/common/Alert';

const Settings = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.theme);
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      buildSuccess: true,
      buildFailure: true,
      pipelineCreated: false,
      memberAdded: true
    },
    inApp: {
      buildSuccess: true,
      buildFailure: true,
      pipelineCreated: true,
      memberAdded: true
    },
    slack: {
      buildSuccess: false,
      buildFailure: true,
      pipelineCreated: false,
      memberAdded: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleThemeChange = (isDark) => {
    dispatch(setDarkMode(isDark));
  };

  const handleNotificationChange = (channel, type, value) => {
    setNotificationSettings({
      ...notificationSettings,
      [channel]: {
        ...notificationSettings[channel],
        [type]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // This would be replaced with actual API call
      // For now, simulate a successful settings update
      console.log('Simulating settings update:', notificationSettings);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Settings</h1>
      
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Settings updated successfully!" onClose={() => setSuccess(false)} />}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="apple-card bg-white">
            <div className="p-5 border-b border-[var(--color-gray-200)]">
              <h2 className="text-xl font-semibold text-[var(--color-black)]">Appearance</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-[var(--color-gray-600)] mb-3">Choose your preferred theme.</p>
              <div className="inline-flex rounded-md shadow-sm bg-[var(--color-gray-100)] p-1" role="group">
                <button
                  type="button"
                  className={`px-4 py-1.5 text-sm font-medium rounded-l-md transition-colors duration-150 ${!darkMode ? 'bg-white text-[var(--color-black)] shadow-sm' : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-200)]'}`}
                  onClick={() => handleThemeChange(false)}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`px-4 py-1.5 text-sm font-medium rounded-r-md transition-colors duration-150 ${darkMode ? 'bg-white text-[var(--color-black)] shadow-sm' : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-200)]'}`}
                  onClick={() => handleThemeChange(true)}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="apple-card bg-white overflow-hidden">
            <div className="p-5 border-b border-[var(--color-gray-200)]">
              <h2 className="text-xl font-semibold text-[var(--color-black)]">Notification Settings</h2>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="apple-table min-w-full">
                  <thead>
                    <tr>
                      <th className="apple-table-th">Event Type</th>
                      <th className="apple-table-th text-center">Email</th>
                      <th className="apple-table-th text-center">In-App</th>
                      <th className="apple-table-th text-center">Slack</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-gray-200)]">
                    {[ 'buildSuccess', 'buildFailure', 'pipelineCreated', 'memberAdded' ].map(eventType => (
                      <tr key={eventType} className="hover:bg-[var(--color-gray-100)] transition-colors duration-150">
                        <td className="apple-table-td text-sm font-medium text-[var(--color-black)]">
                          {eventType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </td>
                        {['email', 'inApp', 'slack'].map(channel => (
                          <td key={channel} className="apple-table-td text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-[var(--color-black)] focus:ring-[var(--color-black)] focus:ring-offset-0 border-[var(--color-gray-300)] rounded"
                              checked={notificationSettings[channel][eventType]}
                              onChange={(e) => handleNotificationChange(channel, eventType, e.target.checked)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="apple-btn apple-btn-primary hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
