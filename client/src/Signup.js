import React from "react";
import "./App.css";

function Signup() {
  return (
    <div className="homepage-bg">
      <div className="homepage-card">
        <div className="login-section" style={{ width: '100%' }}>
          <div className="user-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4"/></svg>
          </div>
          <form className="login-form">
            <input type="text" placeholder="Username" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="btn-primary" type="submit">Sign Up</button>
            <div className="login-options">
              <span>Already have an account?</span>
              <a href="#home">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup; 