import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { clearCaller, setDevUser, setTokenProvider } from "@/lib/api";

const isDevMode =
  import.meta.env.DEV &&
  (import.meta.env.VITE_BYPASS_AUTH === "true" || import.meta.env.MODE === "development");

/**
 * Hands src/lib/api.js a way to get an access token.
 *
 * Installed once, high in the tree, so the modules that call the API do not
 * each have to reach for an Auth0 hook. In dev mode there is no Auth0 and no
 * token, so the signed-in address is sent as a header instead and the backend
 * honours it only when it was started with RECALLCARDS_DEV_AUTH.
 */
export function useApiAuth(user) {
  // Not called in dev mode, where there is no Auth0Provider above us.
  const auth0 = isDevMode ? null : useAuth0();
  const getAccessTokenSilently = auth0?.getAccessTokenSilently;

  useEffect(() => {
    if (isDevMode) {
      setTokenProvider(null);
      setDevUser(user?.email || null);
      return;
    }

    if (!getAccessTokenSilently) return;
    setTokenProvider(getAccessTokenSilently);
    setDevUser(null);
  }, [getAccessTokenSilently, user?.email]);

  useEffect(() => clearCaller, []);
}
