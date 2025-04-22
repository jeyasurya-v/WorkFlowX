import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../features/auth/authSlice';

const Register = () => {
  console.log('Register page');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('19');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, isInitialized, error: authError } = useSelector((state) => state.auth);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // If already authenticated, redirect to dashboard
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isInitialized, navigate]);
  
  // Handle error from redux store
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }
    
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    setLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      console.log('Attempting registration with:', { email: userData.email });
      await dispatch(register(userData)).unwrap();
      
      // Registration successful - Redux state will update and the useEffect hook will handle redirect
      console.log('Registration successful');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-[var(--color-black)] rounded-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-black)]">Create your account</h2>
          <p className="mt-2 text-sm text-[var(--color-gray-600)]">
            Join PipelineRadar to monitor your CI/CD workflows
          </p>
        </div>

        {/* Form Card */}
        <div className="apple-card bg-[var(--color-white)] rounded-lg shadow-md border border-[var(--color-gray-200)] overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="apple-label">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="apple-input"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="apple-label">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="apple-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="apple-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="apple-input"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="apple-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="apple-input"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="apple-label">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="apple-input"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-[var(--color-black)] focus:ring-[var(--color-black)] border-[var(--color-gray-300)] rounded"
                  disabled={loading}
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-[var(--color-gray-700)]">
                  I agree to the <a href="#" className="text-[var(--color-black)] hover:underline">terms and conditions</a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn apple-btn-primary w-full hover-lift"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create account'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="px-6 py-4 bg-[var(--color-gray-100)] border-t border-[var(--color-gray-200)] flex items-center justify-center">
            <span className="text-sm text-[var(--color-gray-600)]">Already have an account?</span>
            <Link to="/auth/login" className="ml-1 text-sm font-medium text-[var(--color-black)] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[var(--color-gray-500)]">
            &copy; {new Date().getFullYear()} PipelineRadar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;