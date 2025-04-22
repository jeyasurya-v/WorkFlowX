import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TextInput from '../../components/forms/TextInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate token exists
    if (!token) {
      setError('Invalid or expired password reset token');
      return;
    }

    setLoading(true);

    try {
      // This would be replaced with actual API call
      // For now, simulate a successful password reset
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      {success ? (
        <Alert 
          type="success" 
          message="Password has been reset successfully! You will be redirected to the login page." 
          className="mb-4" 
        />
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <TextInput
            label="New Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <TextInput
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
