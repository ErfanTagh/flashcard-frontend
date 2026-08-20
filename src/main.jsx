import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from "@auth0/auth0-react";
import './index.scss';
import './index.css';
import App from './App';
import { shareLog } from './lib/shareDebug';
import { setPostLoginDest } from './lib/postLogin';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap Bundle JS
import 'bootstrap/dist/js/bootstrap.bundle.min';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

// Validate Auth0 configuration
if (!domain || !clientId) {
  console.error("Auth0 configuration missing. Please check your .env file.");
  console.error("Required environment variables:");
  console.error("- VITE_AUTH0_DOMAIN");
  console.error("- VITE_AUTH0_CLIENT_ID");
  throw new Error("Auth0 domain and client ID must be set in .env file");
}

// Validate domain format
if (!domain.includes('.auth0.com') && !domain.includes('.us.auth0.com') && !domain.includes('.eu.auth0.com') && !domain.includes('.au.auth0.com')) {
  console.warn("Auth0 domain format might be incorrect. Expected format: your-domain.auth0.com");
}

// Normalize origin to handle both www and non-www versions
const normalizeOrigin = (origin) => {
  // If origin includes www, remove it to ensure consistency with Auth0 callback URLs
  if (origin.includes('www.')) {
    return origin.replace('www.', '');
  }
  return origin;
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const normalizedOrigin = normalizeOrigin(window.location.origin);

// Where to land after Auth0 sends the user back. Auth0 always returns to the
// registered redirectUri (the origin), so without this every login ended on
// the homepage -- someone who clicked "log in" on a share link lost the link.
// appState.returnTo round-trips through Auth0, signup included.
const onRedirectCallback = (appState) => {
  // Everything in here runs inside the SDK's own try/catch around the code
  // exchange. Anything that throws -- including, once, a logging call with a
  // missing import -- is swallowed as a failed login: no session, no error on
  // screen, just the signed-out homepage. Nothing this callback does is worth
  // an authentication failure, so nothing in it is allowed to throw.
  try {
    const returnTo = appState?.returnTo;
    shareLog("auth0 redirect returned, returnTo =", returnTo ?? "(none)");

    // Record where to go, but do not navigate from here. A full page load at
    // this moment races the token cache write, and landing on a protected
    // page before the session is readable bounces the user back to login.
    // App.jsx performs the navigation once it can see the signed-in user.
    if (returnTo && returnTo.startsWith("/")) setPostLoginDest(returnTo);

    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (e) {
    console.warn("[share] redirect callback failed, ignoring:", e);
  }
};

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={normalizedOrigin}
      audience={audience}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      // The login transaction (the state value Auth0 hands back) defaults to
      // sessionStorage, which is scoped per exact origin and dropped by some
      // browsers across a cross-site round trip. Losing it makes the return
      // leg fail with "Invalid state": Auth0 believes the user is signed in,
      // the app does not, and they are left on the signed-out homepage. A
      // cookie survives both -- including a login begun on www. and returned
      // to the bare domain, which this app's normalized redirect URI causes.
      useCookiesForTransactions={true}
      onRedirectCallback={onRedirectCallback}
    >
      <App className="mainApp" />
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

