/**
 * The "I clicked Log in to add it" marker.
 *
 * Auth0 is supposed to bring the user back to the share page via
 * appState.returnTo, but that state does not survive every path through
 * login -- an email-verification detour, for example, lands the user on the
 * homepage as a fresh visit. This marker lives in localStorage precisely so
 * the app can finish the job from anywhere once the user is signed in.
 *
 * Kept for 30 minutes: long enough to survive a signup with verification,
 * short enough that an abandoned click months ago cannot import a deck the
 * user no longer remembers.
 */
const KEY = "pending_share_import";
const MAX_AGE_MS = 30 * 60 * 1000;

export function setPendingShare(shareId) {
  localStorage.setItem(KEY, JSON.stringify({ id: shareId, ts: Date.now() }));
}

export function readPendingShare() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const { id, ts } = JSON.parse(raw);
    if (!id || Date.now() - ts > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return id;
  } catch {
    // A value from the previous release was the bare id string.
    localStorage.removeItem(KEY);
    return raw.length > 0 && raw.length < 64 ? raw : null;
  }
}

export function clearPendingShare() {
  localStorage.removeItem(KEY);
}
