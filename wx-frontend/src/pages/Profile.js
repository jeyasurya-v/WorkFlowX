import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/slices/authSlice';
import TextInput from '../components/forms/TextInput';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // This would be replaced with actual API call
      // For now, simulate a successful profile update
      setTimeout(() => {
        dispatch(updateUserProfile(formData));
        setSuccess(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      // This would be replaced with actual API call
      // For now, simulate a successful password change
      setTimeout(() => {
        setPasswordSuccess(true);
        setPasswordLoading(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }, 1000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
            </div>
            <div className="p-4">
              {error && <Alert type="error" message={error} className="mb-4" />}
              {success && <Alert type="success" message="Profile updated successfully!" className="mb-4" />}
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <TextInput
                  label="Full Name"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <TextInput
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  helpText="Email cannot be changed"
                />
                
                <TextInput
                  label="Job Title"
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
                
                <TextInput
                  label="Company"
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                />
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Change Password */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h2>
            </div>
            <div className="p-4">
              {passwordError && <Alert type="error" message={passwordError} className="mb-4" />}
              {passwordSuccess && <Alert type="success" message="Password changed successfully!" className="mb-4" />}
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <TextInput
                  label="Current Password"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                
                <TextInput
                  label="New Password"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                
                <TextInput
                  label="Confirm New Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    loading={passwordLoading}
                    disabled={passwordLoading}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
