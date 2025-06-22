import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // Implement Google OAuth login
    console.log('Google login clicked');
  };
  
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-left-panel">
          <div className="auth-logo">
            <Link to="/">
              <img src="/logo.svg" alt="RenX" className="logo-img" />
              <span className="logo-text">RenX</span>
            </Link>
          </div>
          
          <div className="auth-content">
            <h1 className="auth-title">Hi, Welcome Back!</h1>
            <p className="auth-subtitle">Lorem Ipsum is simply dummy text of the printing and type setting industry.</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              
              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">keep me signed in</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Register
                </Link>
              </div>
              
              {error && <div className="auth-error">{error}</div>}
              
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Submit'}
              </button>
            </form>
            
            <div className="auth-divider">
              <span className="divider-text">Or, login with your email</span>
            </div>
            
            <button type="button" className="google-button" onClick={handleGoogleLogin}>
              <FaGoogle className="google-icon" />
              <span>Sign In With Google</span>
            </button>
            
            <div className="auth-footer">
              <p>Do not have account Yet? <Link to="/register" className="auth-link">Try for free!</Link></p>
            </div>
          </div>
        </div>
        
        <div className="auth-right-panel">
          <div className="welcome-content">
            <h1>Welcome To Your RenX System.</h1>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
            <p>Lorem Ipsum has been the industry's</p>
          </div>
          
          <div className="dashboard-preview">
            <img src="/dashboard-preview.svg" alt="Dashboard Preview" />
          </div>
          
          <div className="auth-footer-right">
            <div className="footer-links">
              <span>Privacy policy and Terms of use</span>
              <span>Copyright © Designed & Developed byDesignZone 2025</span>
              <span>Privacy policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 