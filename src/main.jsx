import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import './index.css';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap Bundle JS
import 'bootstrap/dist/js/bootstrap.bundle.min';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Sign-in is RecallCards' own (src/auth/AuthProvider.jsx, backed by
// flashcard-backend/accounts.py); there is no identity provider to configure.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App className="mainApp" />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
