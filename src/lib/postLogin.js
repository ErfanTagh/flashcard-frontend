/**
 * Where to go once the user is signed in.
 *
 * Auth0's onRedirectCallback is not a reliable place to navigate from: it only
 * runs when the SDK sees `code` and `state` in the URL, and doing a full
 * `location.replace` from inside it races the token cache write — land on a
 * protected page a moment too early and it bounces you back out to login.
 *
 * So the destination is recorded before leaving for Auth0 and acted on after
 * the app has come back up and knows the user. Same lesson as the share
 * marker: localStorage survives the round trip, in-memory state does not.
 */
import { shareLog } from "./shareDebug";

const KEY = "post_login_dest";
const MAX_AGE_MS = 30 * 60 * 1000;

const MAX_TRIES = 3;

export function setPostLoginDest(path) {
  localStorage.setItem(KEY, JSON.stringify({ path, ts: Date.now(), tries: 0 }));
  shareLog("login starting, destination", path);
}

export function readPostLoginDest() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const { path, ts } = JSON.parse(raw);
    if (!path || !path.startsWith("/") || Date.now() - ts > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return path;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

/**
 * Count an attempt to reach the destination, and say whether to keep trying.
 *
 * The destination is a protected page. If the session is not readable the
 * instant we arrive, the route guard sends the user back out to Auth0 and they
 * return to the homepage -- so the marker has to survive that bounce and try
 * again. It must not try forever, hence the cap.
 */
export function countPostLoginAttempt() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    const tries = (state.tries || 0) + 1;
    if (tries > MAX_TRIES) {
      localStorage.removeItem(KEY);
      return false;
    }
    localStorage.setItem(KEY, JSON.stringify({ ...state, tries }));
    return true;
  } catch {
    localStorage.removeItem(KEY);
    return false;
  }
}

export function clearPostLoginDest() {
  localStorage.removeItem(KEY);
}
