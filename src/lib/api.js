/**
 * Every call to this API carries proof of who is making it.
 *
 * The API used to take the caller's address as an argument -- `email=` in a
 * query string, or a field named `token` that in fact held the address -- and
 * believed it. Knowing an address was the same as owning the account. The
 * backend now derives the caller from a verified access token and
 * ignores any address in the request, so the token has to be attached here.
 *
 * The token comes from the auth provider's `getAccessTokenSilently`, which is only
 * reachable through a React hook. Rather than drag that hook into every module
 * that happens to call the API, the app installs it once (see useApiAuth) and
 * this module asks for a token when it needs one. The provider caches and refreshes
 * behind that call, so asking per request is cheap.
 */

let provideToken = async () => null;
let renewToken = null;
let devUser = null;

/** Called once by useApiAuth, with the token getter. */
export function setTokenProvider(getToken, renew = null) {
  provideToken = typeof getToken === "function" ? getToken : async () => null;
  renewToken = typeof renew === "function" ? renew : null;
}

/**
 * Local development with the dev bypass on. The backend only honours this when it is
 * started with RECALLCARDS_DEV_AUTH set, and refuses to honour it at all when
 * it believes it is in production.
 */
export function setDevUser(email) {
  devUser = email || null;
}

/** Forget the caller, on sign-out. */
export function clearCaller() {
  provideToken = async () => null;
  renewToken = null;
  devUser = null;
}

async function withAuth(headers) {
  const merged = new Headers(headers || {});

  let token = null;
  try {
    token = await provideToken();
  } catch (error) {
    // A silent-token failure means the session is gone. Send the request
    // without one and let the API answer 401, which the app already handles,
    // rather than throwing from inside every caller.
    console.warn("[api] could not get an access token:", error?.message || error);
  }

  if (token) {
    merged.set("Authorization", `Bearer ${token}`);
  } else if (devUser) {
    merged.set("X-Dev-User", devUser);
  }
  return { headers: merged, token };
}

/**
 * fetch, with the caller's token attached.
 *
 * Content-Type is deliberately not forced: a FormData body needs the browser
 * to set it, boundary included, and overriding it breaks the upload.
 */
export async function apiFetch(path, options = {}) {
  const { headers, token } = await withAuth(options.headers);
  const response = await fetch(path, { ...options, headers });
  if (response.status !== 401 || !renewToken) return response;

  // Refused while the app believes it is signed in: the token may be stale
  // in a way its expiry time does not show, or the request may have left
  // before a token was to hand. Renew once and retry; a renewal that fails
  // signs the user out, and the original 401 stands.
  let fresh = null;
  try {
    fresh = await renewToken(token);
  } catch (error) {
    console.warn("[api] could not renew the access token:", error?.message || error);
  }
  if (!fresh || fresh === token) return response;
  const retryHeaders = new Headers(headers);
  retryHeaders.set("Authorization", `Bearer ${fresh}`);
  return fetch(path, { ...options, headers: retryHeaders });
}

/** apiFetch for a JSON body, which is the common case. */
export async function apiPost(path, body, options = {}) {
  return apiFetch(path, {
    method: "POST",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: JSON.stringify(body ?? {}),
  });
}

/**
 * apiFetch that parses the response.
 *
 * The API does not always answer with JSON -- a proxy rejecting an oversized
 * upload returns an HTML error page, and calling .json() on that threw a
 * parse error that read like a bug in the app. Read the text first and say
 * what actually happened.
 */
export async function apiJson(path, options = {}) {
  const response = await apiFetch(path, options);
  const text = await response.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        response.ok
          ? "The server sent a response this app could not read."
          : `The request failed (error ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `The request failed (error ${response.status}).`);
  }
  return data;
}
