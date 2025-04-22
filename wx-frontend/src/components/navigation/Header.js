import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { toggleDarkMode } from '../../store/slices/themeSlice';
import { logout } from '../../features/auth/authSlice';
import Logo from '../common/Logo';

const Header = ({ toggleSidebar, toggleNotifications }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Logout initiated from Header');
    closeUserMenu();
    setIsLoggingOut(true);
    
    try {
      // Dispatch logout action
      await dispatch(logout()).unwrap();
      console.log('Logout successful, navigating to login page');
      
      // Navigate to login page
      navigate('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback - force navigation to login
      navigate('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Format user name for display
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

  return (
    <header className="apple-nav sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200 lg:hidden hover-lift"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <FaBars className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <span className="text-xl font-bold text-gray-900 dark:text-white">PipelineRadar</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200 hover-lift"
              onClick={handleDarkModeToggle}
            >
              <span className="sr-only">Toggle dark mode</span>
              {darkMode ? (
                <FaSun className="h-5 w-5" />
              ) : (
                <FaMoon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200 relative hover-lift"
              onClick={toggleNotifications}
            >
              <span className="sr-only">View notifications</span>
              <FaBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200 hover-lift"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                {user?.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={displayName}
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                )}
                <span className="ml-2 text-gray-700 dark:text-gray-300 hidden md:block font-medium">
                  {displayName || 'User'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/profile"
                      className="apple-nav-link block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      role="menuitem"
                      onClick={closeUserMenu}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="apple-nav-link block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      role="menuitem"
                      onClick={closeUserMenu}
                    >
                      Settings
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      tabIndex={0}
                      aria-disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing out...
                        </span>
                      ) : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
