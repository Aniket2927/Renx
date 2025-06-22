import React from "react";
import "./App.css";

const AuthLayout = ({ children, welcomeTitle, welcomeText }) => (
  <div className="auth-split-bg">
    <div className="auth-form-side">
      {children}
    </div>
    <div className="auth-welcome-side">
      <h1>{welcomeTitle}</h1>
      <p>{welcomeText}</p>
    </div>
  </div>
);

export default AuthLayout; 