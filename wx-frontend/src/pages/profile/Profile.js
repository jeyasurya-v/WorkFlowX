import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaLock, FaHistory, FaEdit, FaSave, FaCamera } from 'react-icons/fa';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * User profile page component
 * @returns {JSX.Element} - User profile page component
 */
const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Personal information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    company: '',
    avatarUrl: ''
  });
  
  // Security settings
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Activity history
  const [activityHistory, setActivityHistory] = useState([]);
  
  useEffect(() => {
    // Initialize user information
    if (user) {
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        avatarUrl: user.avatarUrl || ''
      });
      
      // Fetch activity history
      fetchActivityHistory();
    }
  }, [user]);
  
  const fetchActivityHistory = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock activity data
      const mockActivity = [
        { id: '1', type: 'login', timestamp: '2025-04-20T14:30:00Z', details: 'Logged in from Chrome on Windows' },
        { id: '2', type: 'pipeline_view', timestamp: '2025-04-20T14:35:00Z', details: 'Viewed Frontend CI pipeline' },
        { id: '3', type: 'build_view', timestamp: '2025-04-20T14:40:00Z', details: 'Viewed Build #1234 details' },
        { id: '4', type: 'settings_update', timestamp: '2025-04-19T10:15:00Z', details: 'Updated notification settings' },
        { id: '5', type: 'login', timestamp: '2025-04-19T09:30:00Z', details: 'Logged in from Firefox on macOS' }
      ];
      
      setActivityHistory(mockActivity);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load activity history. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Reset editing state when changing tabs
    if (isEditing) {
      setIsEditing(false);
    }
  };
  
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSecurityInfoChange = (e) => {
    const { name, value } = e.target;
    setSecurityInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
    
    // Reset form if canceling edit
    if (isEditing && user) {
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  };
  
  const handleSavePersonalInfo = async () => {
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Validate form
      if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
        throw new Error('First name, last name, and email are required.');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user information
      // dispatch(updateUserProfile(personalInfo));
      
      setSaveSuccess(true);
      setIsEditing(false);
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Validate form
      if (!securityInfo.currentPassword || !securityInfo.newPassword || !securityInfo.confirmPassword) {
        throw new Error('All password fields are required.');
      }
      
      if (securityInfo.newPassword !== securityInfo.confirmPassword) {
        throw new Error('New password and confirmation do not match.');
      }
      
      if (securityInfo.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update password
      // dispatch(changePassword(securityInfo));
      
      setSaveSuccess(true);
      setSecurityInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
      setIsLoading(false);
    }
  };
  
  const renderTabs = () => (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex -mb-px">
        <button
          onClick={() => handleTabChange('personal')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'personal'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaUser className="inline-block mr-2" />
          Personal Information
        </button>
        <button
          onClick={() => handleTabChange('security')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'security'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaLock className="inline-block mr-2" />
          Security
        </button>
        <button
          onClick={() => handleTabChange('activity')}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            activeTab === 'activity'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FaHistory className="inline-block mr-2" />
          Activity History
        </button>
      </nav>
    </div>
  );
  
  const renderPersonalInfo = () => (
    <div className="space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update your personal information and profile picture.
          </p>
        </div>
        <button
          onClick={handleEditToggle}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isEditing ? 'Cancel' : 'Edit'}
          {!isEditing && <FaEdit className="ml-2 h-4 w-4" />}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
          <div className="relative">
            <img
              src={personalInfo.avatarUrl || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="bg-gray-800 bg-opacity-75 rounded-full p-2 text-white hover:bg-opacity-100"
                >
                  <FaCamera className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="mt-4 text-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {personalInfo.firstName} {personalInfo.lastName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{personalInfo.jobTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{personalInfo.company}</p>
            </div>
          )}
        </div>
        
        <div className="md:w-2/3 md:pl-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={personalInfo.firstName}
                onChange={handlePersonalInfoChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={personalInfo.lastName}
                onChange={handlePersonalInfoChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={personalInfo.jobTitle}
                onChange={handlePersonalInfoChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={personalInfo.company}
                onChange={handlePersonalInfoChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="mt-6">
              <button
                onClick={handleSavePersonalInfo}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
                {!isLoading && <FaSave className="ml-2 h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const renderSecuritySettings = () => (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your password and security preferences.
        </p>
      </div>
      
      <div className="max-w-md">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={securityInfo.currentPassword}
              onChange={handleSecurityInfoChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={securityInfo.newPassword}
              onChange={handleSecurityInfoChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={securityInfo.confirmPassword}
              onChange={handleSecurityInfoChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="twoFactorAuth"
                name="twoFactorAuth"
                type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="twoFactorAuth" className="font-medium text-gray-700 dark:text-gray-300">
                Enable Two-Factor Authentication
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderActivityHistory = () => (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity History</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View your recent account activity.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : activityHistory.length > 0 ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                  Activity
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {activityHistory.map((activity) => (
                <tr key={activity.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                    {activity.type === 'login' && 'Login'}
                    {activity.type === 'pipeline_view' && 'Viewed Pipeline'}
                    {activity.type === 'build_view' && 'Viewed Build'}
                    {activity.type === 'settings_update' && 'Updated Settings'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {activity.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No activity history found.
        </div>
      )}
    </div>
  );
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
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
          message={activeTab === 'personal' ? 'Profile updated successfully' : 'Password changed successfully'} 
          className="mb-4"
        />
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {renderTabs()}
        
        <div className="p-6">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'activity' && renderActivityHistory()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
