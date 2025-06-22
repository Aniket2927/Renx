import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaUser, FaHome, FaExchangeAlt, FaStar, FaBell, FaCog, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null); // 'notifications' | 'settings' | 'messages' | null
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [theme, setTheme] = useState('Light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const notifications = [
    { id: 1, title: 'New invoice received', time: '2 hours ago' },
    { id: 2, title: 'Transaction completed', time: '5 hours ago' },
    { id: 3, title: 'Server update scheduled', time: '1 day ago' }
  ];
  const messages = [
    { id: 1, title: 'Welcome to RenX!', time: 'Today' },
    { id: 2, title: 'Your trade was executed', time: 'Yesterday' },
    { id: 3, title: 'AI prediction available', time: '2 days ago' }
  ];
  const navigate = useNavigate();
  
  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  // Persist theme and notification settings
  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme.toLowerCase()}`);
    localStorage.setItem('theme', theme);
    localStorage.setItem('notifications', notificationsEnabled.toString());
  }, [theme, notificationsEnabled]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');
  }, []);

  const [settingsMessage, setSettingsMessage] = useState('');
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    setSettingsMessage('Theme updated!');
    setTimeout(() => setSettingsMessage(''), 1200);
  };
  const handleNotificationsToggle = () => {
    setNotificationsEnabled((prev) => {
      setSettingsMessage('Notification setting updated!');
      setTimeout(() => setSettingsMessage(''), 1200);
      return !prev;
    });
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="logo">RenX</Link>
        </div>
        
        {isAuthenticated && (
          <div className="navbar-menu-toggle" onClick={toggleSidebar}>
            <span className="menu-icon"></span>
          </div>
        )}
        
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <div className="navbar-links-user-group" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <NavLink to="/dashboard" onClick={closeMenu} className="navbar-icon-link">
                  <FaHome size={22} style={{ display: 'block', margin: '0 auto' }} />
                  <span style={{ display: 'block', fontSize: 13, marginTop: 2 }}>Dashboard</span>
                </NavLink>
                <NavLink to="/trades" onClick={closeMenu} className="navbar-icon-link">
                  <FaExchangeAlt size={22} style={{ display: 'block', margin: '0 auto' }} />
                  <span style={{ display: 'block', fontSize: 13, marginTop: 2 }}>Trades</span>
                </NavLink>
                <NavLink to="/watchlist" onClick={closeMenu} className="navbar-icon-link">
                  <FaStar size={22} style={{ display: 'block', margin: '0 auto' }} />
                  <span style={{ display: 'block', fontSize: 13, marginTop: 2 }}>Watchlist</span>
                </NavLink>
                <div className="navbar-auth" style={{ marginLeft: 0, display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div className="user-dropdown">
                    <button className="dropdown-button">
                      <div className="user-avatar">
                        {user?.name?.charAt(0) || <FaUser />}
                      </div>
                      <span className="user-name">{user?.name || 'User'}</span>
                    </button>
                    <div className="dropdown-content">
                      <Link to="/profile" onClick={closeMenu}>Profile</Link>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  </div>
                  <div className="navbar-icon-group">
                    <div style={{ position: 'relative' }}>
                      <button className="navbar-action-icon" onClick={() => {
                        if (!isAuthenticated) setShowLoginModal(true);
                        else setShowDropdown(showDropdown === 'notifications' ? null : 'notifications');
                      }}>
                        <FaBell size={32} />
                        <span className="navbar-badge">3</span>
                      </button>
                      {showDropdown === 'notifications' && (
                        <div className="tooltip-dropdown" style={{ right: 0, left: 'auto', minWidth: 250, position: 'absolute', top: 'calc(100% + 10px)', zIndex: 1000 }}>
                          <h4>Notifications</h4>
                          {notifications.map(n => (
                            <div key={n.id} className="notification-item">
                              <p>{n.title}</p>
                              <span>{n.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button className="navbar-action-icon" onClick={() => {
                        if (!isAuthenticated) setShowLoginModal(true);
                        else setShowDropdown(showDropdown === 'settings' ? null : 'settings');
                      }}>
                        <FaCog size={32} />
                      </button>
                      {showDropdown === 'settings' && (
                        <div className="tooltip-dropdown" style={{ right: 0, left: 'auto', minWidth: 250, position: 'absolute', top: 'calc(100% + 10px)', zIndex: 1000 }}>
                          <h4>Quick Settings</h4>
                          <div className="settings-item">
                            <p>Theme</p>
                            <select value={theme} onChange={handleThemeChange}>
                              <option>Light</option>
                              <option>Dark</option>
                            </select>
                          </div>
                          <div className="settings-item">
                            <p>Notifications</p>
                            <label className="toggle">
                              <input type="checkbox" checked={notificationsEnabled} onChange={handleNotificationsToggle} />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          {settingsMessage && <div style={{color:'#3498db',marginTop:8,fontWeight:500}}>{settingsMessage}</div>}
                        </div>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button className="navbar-action-icon" onClick={() => {
                        if (!isAuthenticated) setShowLoginModal(true);
                        else setShowDropdown(showDropdown === 'messages' ? null : 'messages');
                      }}>
                        <FaEnvelope size={32} />
                        <span className="navbar-badge">5</span>
                      </button>
                      {showDropdown === 'messages' && (
                        <div className="tooltip-dropdown" style={{ right: 0, left: 'auto', minWidth: 250, position: 'absolute', top: 'calc(100% + 10px)', zIndex: 1000 }}>
                          <h4>Recent Messages</h4>
                          {messages.map(m => (
                            <div key={m.id} className="notification-item">
                              <p>{m.title}</p>
                              <span>{m.time}</span>
                            </div>
                          ))}
                          <button className="view-all-btn" style={{ marginTop: 10 }} onClick={() => navigate('/messages')}>View All</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="login-btn" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="register-btn" onClick={closeMenu}>Register</Link>
            </div>
          )}
        </div>
        
        <div className="navbar-menu-toggle" onClick={handleToggleMenu}>
          <FaBars />
        </div>
      </div>
      {showLoginModal && (
        <div className="modal" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 18 }}>Login Required</h3>
            <p style={{ marginBottom: 18 }}>Please log in to access this feature.</p>
            <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 