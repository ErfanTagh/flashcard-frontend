import { useEffect } from "react";
import { clearCaller, setDevUser, setTokenProvider } from "@/lib/api";
import { isDevBypass, useAuth } from "./useAuth";

/**
 * Hands src/lib/api.js a way to get an access token.
 *
 * Installed once, high in the tree, so the modules that call the API do not
 * each have to reach for the auth hook. With the dev bypass on there is no
 * token, so the signed-in address is sent as a header instead and the backend
 * honours it only when it was started with RECALLCARDS_DEV_AUTH.
 */
export function useApiAuth(user) {
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    if (isDevBypass) {
      setTokenProvider(null);
      setDevUser(user?.email || null);
      return;
    }

    setTokenProvider(getAccessTokenSilently);
    setDevUser(null);
  }, [getAccessTokenSilently, user?.email]);

  useEffect(() => clearCaller, []);
}
