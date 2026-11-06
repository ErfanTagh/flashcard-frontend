import "./assets/app.css";
import "./assets/responsive.css";
import AddFlashcard from "./Components/AddFlashcard.jsx";
import Flashcard from "./Components/Flashcard.jsx";
import Home from "./views/views/Home.jsx";
// Capital C, matching the directory on disk. Spelled lowercase, macOS resolves
// it anyway but Vite caches it as a second, separate module -- so edits landed
// on one copy while the browser kept loading the other.
import Sidebar from "./Components/Sidebar.jsx";
import Profile from "./views/views/Profile.jsx";
import Progress from "./views/views/Progress.jsx";
import Collections from "./views/views/Collections.jsx";
import Quiz from "./views/views/Quiz.jsx";
import ImportShare from "./views/views/ImportShare.jsx";
import ManageCards from "./views/views/ManageCards.jsx";
import Explore from "./views/views/Explore.jsx";
import Blog from "./views/views/Blog.jsx";
import BlogPost from "./views/views/BlogPost.jsx";
import SharedDeck from "./views/views/SharedDeck.jsx";
import BrowseDeck from "./views/views/BrowseDeck.jsx";
import { Login, Signup, VerifyEmail, ForgotPassword, ResetPassword, OAuthCallback } from "./views/auth/AuthPages.jsx";

import { useEffect, useRef } from "react";
import { Route, BrowserRouter, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { withAuthenticationRequired } from "./auth/RequireAuth";
import Footer from "./Components/Footer/Footer.jsx";
import { Toaster } from "@/components/ui/toaster";
import { DevAuthProvider, withDevAuthenticationRequired } from "./utils/devAuth";
import { useAuth, isDevBypass as isDevMode } from "./hooks/useAuth";
import { useApiAuth } from "./hooks/useApiAuth";
import { CollectionsProvider } from "./hooks/useCollections";
import { readPendingShare } from "@/lib/pendingShare";
import { readPostLoginDest, clearPostLoginDest, countPostLoginAttempt } from "@/lib/postLogin";
import { shareLog } from "@/lib/shareDebug";
import { apiPost } from "@/lib/api";

// Pages where someone signs in. A user who appears while on one of them has
// just signed in and belongs somewhere else.
const AUTH_PAGES = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/auth/callback"];

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

  // Give src/lib/api.js a way to get an access token, once, here at the top.
  useApiAuth(user);

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
      // Drop any recorded destination as well. The login that carried this
      // marker also recorded the share page as its destination, and leaving
      // that behind sent the user back to the share page a second time later
      // -- importing the same deck again as a duplicate.
      clearPostLoginDest();
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
    const onLanding =
      location.pathname === "/" || location.pathname === "/home" || AUTH_PAGES.includes(location.pathname);
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
  // Anything that shows a person's name -- "Erfan shared a deck with you" --
  // reads it from the card account. The name given at sign-up comes back with
  // the session; only a real one is sent, never the email-derived fallback.
  useEffect(() => {
    if (!user?.email) return;
    const name = user.given_name || (user.name !== user.nickname ? user.name : "") || "";
    if (!name) return;

    apiPost("/api/profile", { name }).catch(() => {
      // Cosmetic: without it a recipient sees "Someone" instead of a name.
    });
  }, [user?.email, user?.given_name, user?.name, user?.nickname]);

  const handleLogout = () => logout({ returnTo: "/" });

  return (
    // Navigation down the side, the page beside it. min-w-0 on the content
    // column so a wide table or row inside a page cannot push the sidebar off
    // the screen -- a flex child's default minimum is its content.
    <div className="flex min-h-screen">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Open to anyone holding the link, but only as a summary: the API
            sends a signed-out visitor the deck's name, owner, size and cover,
            never the cards. Adding it is what asks them to sign up. */}
        <Route path="/import/:shareId" element={<ImportShare />} />
        {/* Flip through a deck published to Explore, read-only, no account
            needed. The API sends cards only for published decks. */}
        <Route path="/browse/:shareId" element={<BrowseDeck />} />
        {/* Editing through a link is for members only. */}
        <Route
          path="/shared/:shareId"
          element={<ProtectedRoute component={SharedDeck} screen="signup" reason="deck" />}
        />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
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
                  path="collections/:collectionName/cards"
                  element={<ProtectedRoute component={ManageCards} />}
                />
                {/* Open to visitors: published decks are readable by anyone. */}
                <Route path="explore" element={<Explore />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:id" element={<BlogPost />} />
                <Route
                  path="quiz"
                  element={<ProtectedRoute component={Quiz} />}
                />
              </Routes>
      <Footer />
      </div>
    </div>
  );
};

export default function App() {
  // Show dev mode indicator
  if (isDevMode) {
    console.log('🔓 DEV MODE: sign-in bypassed (VITE_BYPASS_AUTH)');
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
