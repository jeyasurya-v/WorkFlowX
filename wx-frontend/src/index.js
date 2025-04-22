import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './assets/css/index.css';
import './styles/apple-theme.css';

// Check for stale logout flags on application start
if (typeof window !== 'undefined') {
  // Add unload listener to clear session if just logged out
  window.addEventListener('beforeunload', () => {
    if (localStorage.getItem('just_logged_out') === 'true') {
      // Ensure the flag persists across page refreshes but not too long
      const timestamp = Date.now();
      localStorage.setItem('just_logged_out_time', timestamp.toString());
    }
  });
  
  // Check for stale logout flags on load
  const logoutTime = localStorage.getItem('just_logged_out_time');
  if (logoutTime) {
    const timestamp = parseInt(logoutTime, 10);
    const now = Date.now();
    // If the logout flag is older than 30 minutes, clear it
    if (now - timestamp > 30 * 60 * 1000) {
      localStorage.removeItem('just_logged_out');
      localStorage.removeItem('just_logged_out_time');
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1D1D1F',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E5E5E7',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#34C759',
                secondary: 'white',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#FF3B30',
                secondary: 'white',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
