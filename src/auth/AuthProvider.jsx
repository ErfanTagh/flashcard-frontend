import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * RecallCards' own sign-in, replacing Auth0.
 *
 * The API (flashcard-backend/accounts.py) issues a short-lived access token
 * and a refresh token. Both are kept in localStorage, the same place the Auth0
 * SDK kept its cache, so a session survives a reload and is shared between
 * tabs. Refresh tokens are single use: the API rotates them on every refresh,
 * so two tabs refreshing at once must not both spend the same one -- the
 * refresh is serialised across tabs with the Web Locks API where it exists, and
 * whichever tab loses the race picks up the session the winner wrote.
 *
 * The context deliberately has the shape of useAuth0() -- user,
 * isAuthenticated, isLoading, error, loginWithRedirect, logout,
 * getAccessTokenSilently -- so pages written against Auth0 keep working.
 */

const STORAGE_KEY = "recallcards_session";
const REFRESH_MARGIN_MS = 60 * 1000;

export class AuthApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.refresh_token && session?.user?.email ? session : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode with storage blocked: the session lasts as long as the tab.
  }
}

/** The token set the API returns, in the shape kept in storage. */
function toSession(body) {
  return {
    access_token: body.access_token,
    expires_at: Date.now() + (Number(body.expires_in) || 3600) * 1000,
    refresh_token: body.refresh_token,
    user: body.user,
  };
}

/** The profile pages read, with the fields they used to get from Auth0. */
function toUser(apiUser) {
  if (!apiUser?.email) return null;
  const fallback = apiUser.email.split("@")[0];
  return {
    ...apiUser,
    name: apiUser.name || fallback,
    nickname: fallback,
    sub: apiUser.email,
    picture: undefined,
  };
}

export async function authRequest(path, body) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new AuthApiError("Could not reach RecallCards. Check your connection and try again.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new AuthApiError(data?.error || `Something went wrong (error ${response.status}).`, {
      status: response.status,
      code: data?.code,
    });
  }
  return data;
}

function withRefreshLock(task) {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request("recallcards-refresh", task);
  }
  return task();
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(readSession);
  const sessionRef = useRef(session);
  const refreshing = useRef(null);

  const setSession = useCallback((next) => {
    sessionRef.current = next;
    writeSession(next);
    setSessionState(next);
  }, []);

  // Another tab signed in, refreshed or signed out.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      const next = readSession();
      sessionRef.current = next;
      setSessionState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // `staleToken`: an access token the API just refused. Its expiry may look
  // fine, so refresh anyway -- unless another tab already replaced it.
  const refresh = useCallback((staleToken = null) => {
    if (refreshing.current) return refreshing.current;

    refreshing.current = withRefreshLock(async () => {
      // Another tab may have refreshed while this one waited for the lock.
      const stored = readSession();
      if (!stored) return null;
      const stillFresh = stored.expires_at - Date.now() > REFRESH_MARGIN_MS;
      if (stillFresh && (!staleToken || stored.access_token !== staleToken)) return stored;

      try {
        const next = toSession(await authRequest("refresh", { refresh_token: stored.refresh_token }));
        return next;
      } catch (error) {
        // A network blip is not a sign-out; a refused token is.
        if (error.status === 401) return null;
        throw error;
      }
    })
      .then((next) => {
        setSession(next);
        return next;
      })
      .finally(() => {
        refreshing.current = null;
      });

    return refreshing.current;
  }, [setSession]);

  const getAccessTokenSilently = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return null;
    if (current.expires_at - Date.now() > REFRESH_MARGIN_MS) return current.access_token;
    const next = await refresh();
    return next?.access_token ?? null;
  }, [refresh]);

  /** After a 401: a token to retry with, or null when signed out. */
  const renewAccessToken = useCallback(
    async (refusedToken) => {
      if (!sessionRef.current) return null;
      const next = await refresh(refusedToken || null);
      return next?.access_token ?? null;
    },
    [refresh]
  );

  const signIn = useCallback(
    async (email, password) => {
      const next = toSession(await authRequest("login", { email, password }));
      setSession(next);
      return next;
    },
    [setSession]
  );

  const signUp = useCallback(
    (email, password, name, next) => authRequest("signup", { email, password, name, next }),
    []
  );

  const verifyEmail = useCallback(
    async (token) => {
      const next = toSession(await authRequest("verify", { token }));
      setSession(next);
      return next;
    },
    [setSession]
  );

  const resetPassword = useCallback(
    async (token, password) => {
      const next = toSession(await authRequest("reset-password", { token, password }));
      setSession(next);
      return next;
    },
    [setSession]
  );

  const logout = useCallback(
    (options = {}) => {
      const current = sessionRef.current;
      if (current?.refresh_token) {
        authRequest("logout", { refresh_token: current.refresh_token }).catch(() => {});
      }
      setSession(null);
      const returnTo = options?.returnTo || options?.logoutParams?.returnTo || "/";
      window.location.assign(returnTo);
    },
    [setSession]
  );

  /** Kept from the Auth0 API: send the visitor to the sign-in page. */
  const loginWithRedirect = useCallback((options = {}) => {
    const returnTo = options?.appState?.returnTo;
    const screen = options?.screen === "signup" || options?.authorizationParams?.screen_hint === "signup"
      ? "/signup"
      : "/login";
    const query = returnTo && returnTo.startsWith("/") ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    window.location.assign(`${screen}${query}`);
  }, []);

  const user = useMemo(() => toUser(session?.user), [session?.user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      error: null,
      getAccessTokenSilently,
      renewAccessToken,
      loginWithRedirect,
      logout,
      signIn,
      signUp,
      verifyEmail,
      resetPassword,
      resendVerification: (email, next) => authRequest("resend-verification", { email, next }),
      forgotPassword: (email) => authRequest("forgot-password", { email }),
    }),
    [user, getAccessTokenSilently, renewAccessToken, loginWithRedirect, logout, signIn, signUp, verifyEmail, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useLocalAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useLocalAuth must be used inside <AuthProvider>");
  return context;
}
