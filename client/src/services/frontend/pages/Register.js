import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import '../styles/Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const validateForm = () => {
    // Reset error
    setError('');
    
    // Form validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register({ username, email, password });
      
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleRegister = () => {
    // Implement Google OAuth registration
    console.log('Google register clicked');
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join RenX platform and explore the future of trading.</p>
            
            <form className="auth-form register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
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
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              
              <div className="policy-agreement">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agreeTerms">
                  I agree to the <Link to="/terms">Terms & Conditions</Link>
                </label>
              </div>
              
              {error && <div className="auth-error">{error}</div>}
              
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Submit'}
              </button>
            </form>
            
            <div className="auth-divider">
              <span className="divider-text">Or, register with</span>
            </div>
            
            <button type="button" className="google-button" onClick={handleGoogleRegister}>
              <FaGoogle className="google-icon" />
              <span>Sign Up With Google</span>
            </button>
            
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
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

export default Register; 