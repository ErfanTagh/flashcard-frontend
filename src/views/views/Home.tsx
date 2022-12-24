import React, { Fragment } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import  "../../assets/landingPage.css";
import {Helmet} from "react-helmet";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (<div className="maindiv">

            <Helmet>
                <meta charSet="utf-8" />
                <title>Recallcards</title>
                <link rel="icon" type="image/png" href="https://play-lh.googleusercontent.com/23G-2LOEXXPeTjElWnYOuacOuk6D8-sL300sl-e-ZTeSmBSKYDR2Y7kXVh3A5lxbKUmX" sizes="16x16" />
                <meta name="description" content="Flashcards for extra learning and memory boosting" />
            </Helmet>

    <h1>Streamline Your Learning With Flashcards</h1>
    <div className="adtitles">
    <h3>Boost Your Memory With Our Instant Flashcards</h3>
    <h3>Sign Up for Free And Start</h3>
    <h3> No Credit Cards Required</h3>

    

    </div>
  </div>);
};

export default LoginButton;
