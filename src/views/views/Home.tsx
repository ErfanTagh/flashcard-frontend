import React, { Fragment } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import  "../../assets/landingPage.css";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (<div className="maindiv">

    <h1>Streamline Your Learning With Flashcards</h1>
    <div className="adtitles">
    <h3>Boost Your Memory With Our Instant Flashcards</h3>
    <h3>Sign Up for Free And Start</h3>
    <h3> No Credit Cards Required</h3>

    

    </div>
  </div>);
};

export default LoginButton;
