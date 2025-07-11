import React, { Fragment, useEffect } from "react";
import { Outlet, Navigate} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import  "../../assets/landingPage.css";
import {Helmet} from "react-helmet";


const LoginButton = () => {
  const { isAuthenticated,loginWithRedirect } = useAuth0();

  return (<div className="maindiv">

        {isAuthenticated && (
          <Navigate to="/home" replace={true} />
        )}

    <h1>Streamline Your Learning With Flashcards</h1>
    <div className="adtitles">
    <h3>Boost Your Memory With Our Instant Flashcards</h3>
    <h3>Sign Up for Free And Start</h3>
    <h3> No Credit Cards Required</h3>

    

    </div>
  </div>);
};

export default LoginButton;
