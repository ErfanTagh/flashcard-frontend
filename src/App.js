import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import MainPage from "./Components/MainPage.tsx";
import { Container } from "reactstrap";

import "./assets/app.css"
import AddFlashcard from "./Components/AddFlashcard.tsx";
import  Flashcard from "./Components/Flashcard.tsx";
import Home from './views/views/Home.tsx';
import NavBar from "./Components/auth0components/NavBar.tsx";
import history from "./utils/history.tsx";
import Profile from "./views/views/Profile.tsx";

import { Route, BrowserRouter, Routes, useNavigate } from 'react-router-dom';
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';
import Footer from './Components/Footer/Footer.tsx';

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};

const Auth0ProviderWithRedirectCallback = ({ children, ...props }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState) => {
    navigate( appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.href = "http://recallcards.uk/home");
  };
  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};


export default function App() {




  return (
   
  

  <div id="app" className="d-flex flex-column h-100">

  <BrowserRouter>

  <Auth0ProviderWithRedirectCallback
        domain="dev-43bumhcy.us.auth0.com"
        clientId="k9q4k2SI9OuxDAh8YY6ykLMnEK3Bq44u"
        redirectUri={window.location.origin}
        audience = "recallcards"
      >

        <NavBar/>

      <Routes>
        <Route path="" exact element={<Home />} />
        <Route path="profile" element={<ProtectedRoute component={Profile }/>} />
        <Route path="home" element={<ProtectedRoute component={MainPage} />} />
        <Route path="addword" element={<ProtectedRoute component={AddFlashcard} />} />
            <Route path="flashcards" element={<ProtectedRoute component={Flashcard} />} />
         
      </Routes>
      </Auth0ProviderWithRedirectCallback>
      </BrowserRouter>

      <Footer/>

  </div>



  )
}


