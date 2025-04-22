import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NotFound = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-[var(--color-black)]">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-[var(--color-black)]">Page not found</h2>
        <p className="mt-2 text-base text-[var(--color-gray-600)]">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link
            to={isAuthenticated ? '/' : '/auth/login'}
            className="apple-btn apple-btn-primary hover-lift"
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
