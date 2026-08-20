import "./assets/app.css";
import "./assets/responsive.css";
import AddFlashcard from "./Components/AddFlashcard.jsx";
import Flashcard from "./Components/Flashcard.jsx";
import Home from "./views/views/Home.jsx";
import ModernNavbar from "./components/ModernNavbar.tsx";
import Profile from "./views/views/Profile.jsx";
import Progress from "./views/views/Progress.jsx";
import Collections from "./views/views/Collections.jsx";
import Quiz from "./views/views/Quiz.jsx";
import ImportShare from "./views/views/ImportShare.jsx";

import { useEffect, useRef } from "react";
import { Route, BrowserRouter, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  withAuthenticationRequired,
} from "@auth0/auth0-react";
import Footer from "./Components/Footer/Footer.jsx";
import { Toaster } from "@/components/ui/toaster";
import { DevAuthProvider, withDevAuthenticationRequired } from "./utils/devAuth";
import { useAuth } from "./hooks/useAuth";
import { CollectionsProvider } from "./hooks/useCollections";
import { readPendingShare } from "@/lib/pendingShare";
import { readPostLoginDest, clearPostLoginDest, countPostLoginAttempt } from "@/lib/postLogin";
import { shareLog } from "@/lib/shareDebug";

// Check if we're in development mode and should bypass Auth0
const isDevMode = import.meta.env.DEV && (import.meta.env.VITE_BYPASS_AUTH === 'true' || import.meta.env.MODE === 'development');

// Memoised per component: building the wrapper during render produced a brand
// new component type on every render, so React unmounted and remounted the
// page underneath it and every piece of its state was thrown away.
const protectedCache = new Map();

const ProtectedRoute = ({ component, ...args }) => {
  if (!protectedCache.has(component)) {
    protectedCache.set(
      component,
      isDevMode
        ? withDevAuthenticationRequired(component, args)
        : withAuthenticationRequired(component, args)
    );
  }

  const Component = protectedCache.get(component);
  return <Component />;
};

const AppContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where a signed-in user belongs, decided once per page load.
  //
  // This deliberately does not depend on Auth0's redirect callback or on a
  // marker surviving the round trip. Neither is reliable: the callback only
  // runs when the SDK finds code and state in the URL, and a session restored
  // silently from the cache never produces those at all -- which is most
  // visits. The only thing that always happens is that the app, at some point,
  // learns who the user is. That is the moment to act on.
  //
  // Guarded by a ref so it fires once per load: someone who later presses
  // "Back to Home" is navigating deliberately and must be left alone.
  const handledArrival = useRef(false);
  useEffect(() => {
    if (!user?.email || handledArrival.current) return;
    handledArrival.current = true;

    // A share import outranks everything: that user asked for a specific deck.
    const pending = readPendingShare();
    if (pending) {
      if (location.pathname.startsWith("/import/")) return;
      shareLog("signed in as", user.email, "with share marker", pending, "- walking to share page");
      navigate(`/import/${pending}`, { replace: true });
      return;
    }

    // An explicit destination, if the login recorded one and it survived.
    const dest = readPostLoginDest();
    clearPostLoginDest();

    // Otherwise: a signed-in user sitting on the marketing homepage wants the
    // app, not the pitch.
    const onLanding = location.pathname === "/" || location.pathname === "/home";
    const target = dest || (onLanding ? "/collections" : null);
    if (!target || target === location.pathname) {
      shareLog("signed in as", user.email, "on", location.pathname, "- staying");
      return;
    }
    shareLog("signed in as", user.email, "on", location.pathname, "- going to", target);
    navigate(target, { replace: true });
  }, [user?.email, location.pathname, navigate]);

  // Tell the API who this email belongs to, once per sign-in.
  //
  // The backend only ever knew addresses, so anything that shows a person's
  // name -- "Erfan shared a deck with you" -- had nothing to show. Auth0 holds
  // the profile and hands it to the client only, and for a Google sign-in it
  // fills in given_name itself, so there is nothing to ask the user for.
  useEffect(() => {
    if (!user?.email) return;
    const name = user.given_name || user.name || user.nickname || "";
    if (!name) return;

    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token: user.email, name }),
    }).catch(() => {
      // Cosmetic: without it a recipient sees "Someone" instead of a name.
    });
  }, [user?.email, user?.given_name, user?.name, user?.nickname]);

  // Normalize origin to handle both www and non-www versions
  const normalizeOrigin = (origin) => {
    if (origin.includes('www.')) {
      return origin.replace('www.', '');
    }
    return origin;
  };

  const handleLogout = () => {
    if (isDevMode) {
      logout();
    } else {
      logout({
        returnTo: normalizeOrigin(window.location.origin),
      });
    }
  };

  return (
    <>
      <ModernNavbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Readable without an account: a share link has to show what it holds
            before asking anyone to sign up. */}
        <Route path="/import/:shareId" element={<ImportShare />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="profile"
          element={<ProtectedRoute component={Profile} />}
        />
        <Route
          path="progress"
          element={<ProtectedRoute component={Progress} />}
        />
        <Route
          path="addword"
          element={<ProtectedRoute component={AddFlashcard} />}
        />
        <Route
          path="flashcards"
          element={<ProtectedRoute component={Flashcard} />}
        />
                <Route
                  path="collections"
                  element={<ProtectedRoute component={Collections} />}
                />
                <Route
                  path="quiz"
                  element={<ProtectedRoute component={Quiz} />}
                />
              </Routes>
      <Footer />
    </>
  );
};

export default function App() {
  // Show dev mode indicator
  if (isDevMode) {
    console.log('🔓 DEV MODE: Auth0 authentication bypassed');
  }

  return (
    <div id="app" className="d-flex flex-column h-100">
      <BrowserRouter>
        {isDevMode ? (
          <DevAuthProvider>
            <CollectionsProvider>
              <AppContent />
              <Toaster />
            </CollectionsProvider>
          </DevAuthProvider>
        ) : (
          <CollectionsProvider>
            <AppContent />
            <Toaster />
          </CollectionsProvider>
        )}
      </BrowserRouter>
    </div>
  );
}
