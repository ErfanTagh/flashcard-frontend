import MainPage from "./Components/MainPage.jsx";
import "./assets/app.css";
import "./assets/responsive.css";
import AddFlashcard from "./Components/AddFlashcard.jsx";
import Flashcard from "./Components/Flashcard.jsx";
import Home from "./views/views/Home.jsx";
import NavBar from "./Components/auth0components/NavBar.jsx";
import Profile from "./views/views/Profile.jsx";

import { Route, BrowserRouter, Routes, useNavigate } from "react-router-dom";
import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import Footer from "./Components/Footer/Footer.jsx";

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
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
          <NavBar />

          <Routes>
            <Route path="" exact element={<Home />} />
            <Route
              path="profile"
              element={<ProtectedRoute component={Profile} />}
            />
            <Route
              path="home"
              element={<ProtectedRoute component={MainPage} />}
            />
            <Route
              path="addword"
              element={<ProtectedRoute component={AddFlashcard} />}
            />
            <Route
              path="flashcards"
              element={<ProtectedRoute component={Flashcard} />}
            />
          </Routes>
        </Auth0Provider>
      </BrowserRouter>

      <Footer />
    </div>
  );
}
