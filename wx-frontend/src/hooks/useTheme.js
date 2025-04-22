import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDarkMode } from '../store/slices/themeSlice';

// Create context
const ThemeContext = createContext();

/**
 * Theme provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.theme);

  // Apply theme to document when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        dispatch(setDarkMode(e.matches));
      }
    };
    
    // Initial check
    if (!localStorage.getItem('theme')) {
      dispatch(setDarkMode(mediaQuery.matches));
    }
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch]);

  // Context value
  const value = {
    darkMode,
    toggleDarkMode: () => dispatch(setDarkMode(!darkMode)),
    setDarkMode: (isDark) => dispatch(setDarkMode(isDark))
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @returns {Object} - Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;
