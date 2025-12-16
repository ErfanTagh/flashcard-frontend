import { useAuth0 } from "@auth0/auth0-react";
import { useDevAuth } from "../utils/devAuth";

// Check if we're in development mode
const isDevMode = import.meta.env.DEV && (import.meta.env.VITE_BYPASS_AUTH === 'true' || import.meta.env.MODE === 'development');

/**
 * Unified auth hook that works with both Auth0 and dev mode
 * Components should use this instead of useAuth0 directly
 */
export const useAuth = () => {
  if (isDevMode) {
    return useDevAuth();
  }
  return useAuth0();
};

