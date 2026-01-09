import React, { createContext, useContext, useState } from 'react';

// Mock user for development
const mockUser = {
  email: 'dev@local.com',
  email_verified: true,
  name: 'Dev User',
  given_name: 'Dev',
  family_name: 'User',
  nickname: 'devuser',
  picture: 'https://ui-avatars.com/api/?name=Dev+User&background=6366f1&color=fff',
  sub: 'dev|local',
  updated_at: new Date().toISOString(),
};

const DEV_AUTH_KEY = 'dev_auth_authenticated';

// Mock Auth0 Context for development
const DevAuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginWithRedirect: () => {
    console.log('[DEV MODE] loginWithRedirect called');
  },
  logout: () => {
    console.log('[DEV MODE] logout called');
  },
  getAccessTokenSilently: async () => {
    console.log('[DEV MODE] getAccessTokenSilently called');
    return 'dev-token';
  },
  getAccessTokenWithPopup: async () => {
    console.log('[DEV MODE] getAccessTokenWithPopup called');
    return 'dev-token';
  },
});

export const useDevAuth = () => useContext(DevAuthContext);

// Mock Auth0 Provider for development
export const DevAuthProvider = ({ children }) => {
  // Initialize auth state from localStorage or default to false
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem(DEV_AUTH_KEY);
    return stored === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginWithRedirect = () => {
    console.log('[DEV MODE] loginWithRedirect called');
    setIsLoading(true);
    // Simulate login redirect delay
    setTimeout(() => {
      setIsAuthenticated(true);
      localStorage.setItem(DEV_AUTH_KEY, 'true');
      setIsLoading(false);
    }, 100);
  };

  const logout = (options = {}) => {
    console.log('[DEV MODE] logout called');
    setIsAuthenticated(false);
    localStorage.setItem(DEV_AUTH_KEY, 'false');
    // If returnTo is specified, navigate there, otherwise reload
    if (options?.returnTo) {
      window.location.href = options.returnTo;
    } else {
      window.location.reload();
    }
  };

  const value = {
    user: isAuthenticated ? mockUser : null,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently: async () => {
      console.log('[DEV MODE] getAccessTokenSilently called');
      return 'dev-token';
    },
    getAccessTokenWithPopup: async () => {
      console.log('[DEV MODE] getAccessTokenWithPopup called');
      return 'dev-token';
    },
  };

  return (
    <DevAuthContext.Provider value={value}>
      {children}
    </DevAuthContext.Provider>
  );
};

// Mock withAuthenticationRequired for development
export const withDevAuthenticationRequired = (Component, options = {}) => {
  return (props) => {
    return <Component {...props} />;
  };
};

