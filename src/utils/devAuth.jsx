import React, { createContext, useContext, useState } from 'react';

const DEV_AUTH_KEY = 'dev_auth_authenticated';
const DEV_USER_KEY = 'dev_auth_user';

/**
 * The signed-in identity while the Auth0 bypass is on.
 *
 * Sharing takes two people to test -- one owns a deck, another opens the link
 * -- and a single hardcoded mock user cannot be both. The address is kept in
 * localStorage so it can be switched, and only ever read here, in code that
 * runs when the bypass is active.
 *
 * In any console:  __devUser('amir@local.test')  switches and reloads,
 *                  __devUser()                   prints who you are now.
 */
const buildMockUser = (email) => {
  const name = email.split('@')[0];
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    email,
    email_verified: true,
    name: `${label} (dev)`,
    given_name: label,
    family_name: 'Dev',
    nickname: name,
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=6366f1&color=fff`,
    sub: `dev|${name}`,
    updated_at: new Date().toISOString(),
  };
};

const currentDevEmail = () =>
  localStorage.getItem(DEV_USER_KEY) || 'dev@local.com';

const mockUser = buildMockUser(currentDevEmail());

if (typeof window !== 'undefined') {
  window.__devUser = (email) => {
    if (!email) return currentDevEmail();
    localStorage.setItem(DEV_USER_KEY, email);
    localStorage.setItem(DEV_AUTH_KEY, 'true');
    location.href = '/collections';
    return `switching to ${email}`;
  };
}

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

