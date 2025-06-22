import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/HomeNavbar.css';

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll event to change navbar style when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  const scrollToSection = (sectionId) => {
    closeMenu();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <nav className={`home-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="home-navbar-container">
        <div className="home-navbar-brand">
          <Link to="/" className="home-logo">RenX</Link>
        </div>
        
        <div className={`home-navbar-menu ${menuOpen ? 'active' : ''}`}>
          <div className="home-navbar-links">
            <a href="#home" onClick={() => scrollToSection('home')} className="nav-link">Home</a>
            <a href="#features" onClick={() => scrollToSection('features')} className="nav-link">Features</a>
            <a href="#pricing" onClick={() => scrollToSection('pricing')} className="nav-link">Pricing</a>
            <a href="#about" onClick={() => scrollToSection('about')} className="nav-link">About Us</a>
          </div>
          
          <div className="home-navbar-auth">
            <Link to="/login" className="login-btn" onClick={closeMenu}>Sign In</Link>
            <Link to="/register" className="register-btn" onClick={closeMenu}>Sign Up</Link>
          </div>
        </div>
        
        <div className="home-navbar-toggle" onClick={handleToggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar; 