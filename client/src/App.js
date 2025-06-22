import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import WelcomePage from "./WelcomePage";
import ProfileRoute from "./components/profile/ProfileRoute";
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './components/dashboard/Dashboard';

function validateEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function SignInForm({ onSwitch, onSignInSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username) {
      setError("Username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Signed in successfully!");
      setTimeout(() => {
        onSignInSuccess(username);
        navigate("/welcome", { state: { username } });
      }, 800);
    }, 1200);
  };

  return (
    <AuthLayout welcomeTitle="WELCOME BACK!" welcomeText="Lorem ipsum, dolor sit amet consectetur adipisicing.">
      <div className="auth-form">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="input-group">
            <label>Username</label>
            <div className="input-icon-wrapper">
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
              <span className="input-icon">
                <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4"/></svg>
              </span>
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <span className="input-icon" style={{cursor:'pointer'}} onClick={() => setShowPassword(v => !v)}>
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.61 3.16-4.77 5.66-6.11"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/><path d="M14.12 14.12A3 3 0 0 1 12 15a3 3 0 0 1-2.12-5.12"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12C2.73 7.11 7 4 12 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </span>
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <button className="auth-btn" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        </form>
        <div className="auth-switch-text">
          Dont have an account? <span className="auth-link" onClick={onSwitch}>Sign Up</span>
        </div>
      </div>
    </AuthLayout>
  );
}

function SignUpForm({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain a number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain a special character");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!terms) {
      setError("You must agree to the terms");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Signed up successfully!");
    }, 1200);
  };

  const strength = passwordStrength(password);
  const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#ff2d7a", "#ff7a2d", "#ffd02d", "#7f8cff", "#2dff7a"];

  return (
    <AuthLayout welcomeTitle="WELCOME BACK!" welcomeText="Lorem ipsum, dolor sit amet consectetur adipisicing.">
      <div className="auth-form">
        <h2 className="auth-title">Sign Up</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="input-group">
            <label>Username</label>
            <div className="input-icon-wrapper">
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
              <span className="input-icon">
                <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4"/></svg>
              </span>
            </div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="input-icon-wrapper">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <span className="input-icon">
                <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6 12 13 2 6"/></svg>
              </span>
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <span className="input-icon" style={{cursor:'pointer'}} onClick={() => setShowPassword(v => !v)}>
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.61 3.16-4.77 5.66-6.11"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/><path d="M14.12 14.12A3 3 0 0 1 12 15a3 3 0 0 1-2.12-5.12"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12C2.73 7.11 7 4 12 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </span>
            </div>
            <div className="password-strength">
              <div className="strength-bar" style={{width: `${(strength/4)*100}%`, background: strengthColors[strength-1] || '#eee'}}></div>
              <span className="strength-label" style={{color: strengthColors[strength-1] || '#aaa'}}>{password ? strengthLabels[strength-1] || strengthLabels[0] : ''}</span>
            </div>
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-icon-wrapper">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <span className="input-icon" style={{cursor:'pointer'}} onClick={() => setShowConfirmPassword(v => !v)}>
                {showConfirmPassword ? (
                  <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.61 3.16-4.77 5.66-6.11"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/><path d="M14.12 14.12A3 3 0 0 1 12 15a3 3 0 0 1-2.12-5.12"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="#7f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12C2.73 7.11 7 4 12 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </span>
            </div>
          </div>
          <div className="input-group terms-group">
            <label style={{display:'flex',alignItems:'center',fontWeight:400}}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{marginRight:8}} />
              I agree to the <a href="#terms" style={{color:'#7f8cff',marginLeft:4}}>Terms & Conditions</a>
            </label>
          </div>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <button className="auth-btn" type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
        </form>
        <div className="auth-switch-text">
          Already have an account? <span className="auth-link" onClick={onSwitch}>Login</span>
        </div>
      </div>
    </AuthLayout>
  );
}

function Home() {
  const [_showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
    setShowProfileMenu(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
    setShowProfileMenu(false);
  };

  const handleSwitchToSignUp = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const handleSwitchToSignIn = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignInSuccess = (_username) => {
    // No longer needed to set welcomePage here
  };
  
  const handleTradesDirect = () => {
    navigate('/welcome?section=trades', { state: { username: 'Demo User' } });
  };

  return (
    <div className="homepage-bg">
      <div className="homepage-card">
        {(!showSignIn && !showSignUp) && (
          <header className="navbar">
            <div className="logo">RenX</div>
            <nav>
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#pricing">Pricing</a>
              <a href="#features">Features</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="nav-actions">
              <button 
                onClick={handleTradesDirect}
                style={{
                  background: '#4f8cff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  marginRight: '12px',
                  cursor: 'pointer'
                }}
              >
                Trade Now
              </button>
              <div className="profile-icon" onClick={() => setShowProfileMenu(!_showProfileMenu)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4"/>
                </svg>
                {_showProfileMenu && (
                  <div className="profile-dropdown">
                    <button onClick={handleSignInClick}>Sign In</button>
                    <button onClick={handleSignUpClick}>Sign Up</button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}
        <div className="homepage-content">
          {showSignIn && <SignInForm onSwitch={handleSwitchToSignUp} onSignInSuccess={handleSignInSuccess} />}
          {showSignUp && <SignUpForm onSwitch={handleSwitchToSignIn} />}
          {!showSignIn && !showSignUp && (
            <div className="welcome-section">
              <h1>Welcome.</h1>
              <p>Experience next-gen AI-powered trading. Real-time analysis, automated strategies, and smart portfolio insights at your fingertips.</p>
              <div className="features-list">
                <div className="feature-item">
                  <span role="img" aria-label="ai">🤖</span>
                  <h3>AI Analysis</h3>
                  <p>Get real-time market predictions powered by advanced AI models.</p>
                </div>
                <div className="feature-item">
                  <span role="img" aria-label="auto">⚡</span>
                  <h3>Auto Trading</h3>
                  <p>Automate your trades with customizable AI-driven strategies.</p>
                </div>
                <div className="feature-item">
                  <span role="img" aria-label="insight">📊</span>
                  <h3>Portfolio Insights</h3>
                  <p>Visualize and optimize your portfolio with smart insights.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileRoute />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

function WelcomePageWrapper() {
  const location = useLocation();
  // Check if there's a section specified in the URL
  const queryParams = new URLSearchParams(location.search);
  const section = queryParams.get('section');
  
  return (
    <WelcomePage 
      username={location.state?.username} 
      initialSection={section || 'wallet'} 
    />
  );
}

export default App;
