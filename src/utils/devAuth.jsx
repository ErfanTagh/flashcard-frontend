import React, { createContext, useContext } from 'react';

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

// Mock Auth0 Context for development
const DevAuthContext = createContext({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  loginWithRedirect: () => {
    console.log('[DEV MODE] loginWithRedirect called - already authenticated');
  },
  logout: () => {
    console.log('[DEV MODE] logout called');
    window.location.reload();
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
  const value = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    loginWithRedirect: () => {
      console.log('[DEV MODE] loginWithRedirect called - already authenticated');
    },
    logout: () => {
      console.log('[DEV MODE] logout called');
      window.location.reload();
    },
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

