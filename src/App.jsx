import "./assets/app.css";
import "./assets/responsive.css";
import AddFlashcard from "./Components/AddFlashcard.jsx";
import Flashcard from "./Components/Flashcard.jsx";
import Home from "./views/views/Home.jsx";
import ModernNavbar from "./components/ModernNavbar.tsx";
import Profile from "./views/views/Profile.jsx";
import Progress from "./views/views/Progress.jsx";
import Collections from "./views/views/Collections.jsx";

import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import {
  Auth0Provider,
  withAuthenticationRequired,
} from "@auth0/auth0-react";
import Footer from "./Components/Footer/Footer.jsx";
import { Toaster } from "@/components/ui/toaster";
import { DevAuthProvider, withDevAuthenticationRequired } from "./utils/devAuth";
import { useAuth } from "./hooks/useAuth";
import { CollectionsProvider } from "./hooks/useCollections";

// Check if we're in development mode and should bypass Auth0
const isDevMode = import.meta.env.DEV && (import.meta.env.VITE_BYPASS_AUTH === 'true' || import.meta.env.MODE === 'development');

const ProtectedRoute = ({ component, ...args }) => {
  const Component = isDevMode 
    ? withDevAuthenticationRequired(component, args)
    : withAuthenticationRequired(component, args);
  return <Component />;
};

const AppContent = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (isDevMode) {
      logout();
    } else {
      logout({
        returnTo: window.location.origin,
      });
    }
  };

  return (
    <>
      <ModernNavbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="" element={<Navigate to="/collections" replace />} />
        <Route
          path="profile"
          element={<ProtectedRoute component={Profile} />}
        />
        <Route
          path="progress"
          element={<ProtectedRoute component={Progress} />}
        />
        <Route path="home" element={<Navigate to="/collections" replace />} />
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
          <Auth0Provider
            domain="dev-43bumhcy.us.auth0.com"
            clientId="k9q4k2SI9OuxDAh8YY6ykLMnEK3Bq44u"
            redirectUri={window.location.origin}
            audience="recallcards"
          >
            <CollectionsProvider>
              <AppContent />
              <Toaster />
            </CollectionsProvider>
          </Auth0Provider>
        )}
      </BrowserRouter>
    </div>
  );
}
