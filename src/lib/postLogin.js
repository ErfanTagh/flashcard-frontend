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
const KEY = "post_login_dest";
const MAX_AGE_MS = 30 * 60 * 1000;

export function setPostLoginDest(path) {
  localStorage.setItem(KEY, JSON.stringify({ path, ts: Date.now() }));
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

export function clearPostLoginDest() {
  localStorage.removeItem(KEY);
}
