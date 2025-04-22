import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../../components/common/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // This would be replaced with actual API call
      // For now, simulate a successful request
      console.log('Simulating forgot password request for:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error sending reset link:', err);
      setError(err.message || 'Failed to send reset link. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {error && <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />}
      
      {success ? (
        <div className="space-y-6">
          <Alert 
            type="success" 
            message="Reset link sent! Check your email for instructions to reset your password." 
          />
          <Link
            to="/auth/login"
            className="apple-btn apple-btn-primary w-full hover-lift"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="apple-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleChange}
              className="apple-input"
            />
            <p className="mt-2 text-xs text-[var(--color-gray-500)]">
              We'll send a password reset link to this email address.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="apple-btn apple-btn-primary w-full hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link to="/auth/login" className="font-medium text-[var(--color-black)] hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
