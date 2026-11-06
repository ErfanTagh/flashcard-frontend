import { useLocalAuth } from "../auth/AuthProvider";
import { useDevAuth } from "../utils/devAuth";

// The mock sign-in from utils/devAuth, only when asked for explicitly. Plain
// `npm run dev` uses the real local sign-in: the backend prints the emailed
// links to its log when no mail service is configured.
export const isDevBypass = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true";

/**
 * Unified auth hook. Components use this rather than reaching for a provider.
 */
export const useAuth = () => {
  if (isDevBypass) {
    return useDevAuth();
  }
  return useLocalAuth();
};
