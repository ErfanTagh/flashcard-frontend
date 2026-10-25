/**
 * Every call to this API carries proof of who is making it.
 *
 * The API used to take the caller's address as an argument -- `email=` in a
 * query string, or a field named `token` that in fact held the address -- and
 * believed it. Knowing an address was the same as owning the account. The
 * backend now derives the caller from a verified Auth0 access token and
 * ignores any address in the request, so the token has to be attached here.
 *
 * The token comes from Auth0's `getAccessTokenSilently`, which is only
 * reachable through a React hook. Rather than drag that hook into every module
 * that happens to call the API, the app installs it once (see useApiAuth) and
 * this module asks for a token when it needs one. Auth0 caches and refreshes
 * behind that call, so asking per request is cheap.
 */

let provideToken = async () => null;
let devUser = null;

/** Called once by useApiAuth, with Auth0's token getter. */
export function setTokenProvider(getToken) {
  provideToken = typeof getToken === "function" ? getToken : async () => null;
}

/**
 * Local development without Auth0. The backend only honours this when it is
 * started with RECALLCARDS_DEV_AUTH set, and refuses to honour it at all when
 * it believes it is in production.
 */
export function setDevUser(email) {
  devUser = email || null;
}

/** Forget the caller, on sign-out. */
export function clearCaller() {
  provideToken = async () => null;
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
  return merged;
}

/**
 * fetch, with the caller's token attached.
 *
 * Content-Type is deliberately not forced: a FormData body needs the browser
 * to set it, boundary included, and overriding it breaks the upload.
 */
export async function apiFetch(path, options = {}) {
  const headers = await withAuth(options.headers);
  return fetch(path, { ...options, headers });
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
