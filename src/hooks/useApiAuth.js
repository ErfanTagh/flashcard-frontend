import { setDevUser, setTokenProvider } from "@/lib/api";
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
  const { getAccessTokenSilently, renewAccessToken } = useAuth();

  // Installed while rendering, not in an effect. React runs a child's effects
  // before its parent's, so a page that loads its data on mount -- the deck
  // behind a share link, opened in a new tab -- could otherwise send its first
  // request before this ran, with no token. Both calls only swap a module
  // reference, so doing it on every render is cheap and idempotent.
  if (isDevBypass) {
    setTokenProvider(null);
    setDevUser(user?.email || null);
  } else {
    setTokenProvider(getAccessTokenSilently, renewAccessToken);
    setDevUser(null);
  }
}
