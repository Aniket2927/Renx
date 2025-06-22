import React from "react";
import "./App.css";

function Signin() {
  return (
    <div className="video-background">
      {/* Video Background */}
      <video autoPlay muted loop id="bg-video">
        <source src="/videos/background-video.webm" type="video/webm" />
        {/* Fallback if WebM isn't supported */}
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay to ensure form visibility */}
      <div className="video-overlay"></div>
      
      {/* Original content */}
      <div className="homepage-card">
        <div className="login-section" style={{ width: '100%' }}>
          <div className="user-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4"/></svg>
          </div>
          <form className="login-form">
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="btn-primary" type="submit">Sign In</button>
            <div className="login-options">
              <span>Don't have an account?</span>
              <a href="#signup">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signin; 