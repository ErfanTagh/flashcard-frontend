import "./assets/app.css";
import "./assets/responsive.css";
import AddFlashcard from "./Components/AddFlashcard.jsx";
import Flashcard from "./Components/Flashcard.jsx";
import Home from "./views/views/Home.jsx";
import ModernNavbar from "./components/ModernNavbar.tsx";
import Profile from "./views/views/Profile.jsx";

import { Route, BrowserRouter, Routes } from "react-router-dom";
import {
  Auth0Provider,
  withAuthenticationRequired,
  useAuth0,
} from "@auth0/auth0-react";
import Footer from "./Components/Footer/Footer.jsx";
import { Toaster } from "@/components/ui/toaster";

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};

const AppContent = () => {
  const { user, logout } = useAuth0();

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    });
  };

  return (
    <>
      <ModernNavbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="" exact element={<Home />} />
        <Route
          path="profile"
          element={<ProtectedRoute component={Profile} />}
        />
        <Route path="home" element={<ProtectedRoute component={Home} />} />
        <Route
          path="addword"
          element={<ProtectedRoute component={AddFlashcard} />}
        />
        <Route
          path="flashcards"
          element={<ProtectedRoute component={Flashcard} />}
        />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <div id="app" className="d-flex flex-column h-100">
      <BrowserRouter>
        <Auth0Provider
          domain="dev-43bumhcy.us.auth0.com"
          clientId="k9q4k2SI9OuxDAh8YY6ykLMnEK3Bq44u"
          redirectUri={window.location.origin}
          audience="recallcards"
        >
          <AppContent />
          <Toaster />
        </Auth0Provider>
      </BrowserRouter>

      <Footer />
    </div>
  );
}
