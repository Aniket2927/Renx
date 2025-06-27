import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import './ProfileRoute.css';

const ProfileRoute = () => {
  const location = useLocation();
  const username = location.state?.username || 'User';

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">RenX</div>
        <div className="user-info">
          <button className="user-button">
            <span className="user-avatar">{username[0].toUpperCase()}</span>
            <span className="user-name">{username}</span>
          </button>
        </div>
      </header>

      <div className="app-body">
        <nav className="app-nav">
          <ul>
            <li>
              <a href="/dashboard">
                <i className="icon">🏠</i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/trades">
                <i className="icon">📈</i>
                <span>Trades</span>
              </a>
            </li>
            <li>
              <a href="/watchlist">
                <i className="icon">⭐</i>
                <span>Watchlist</span>
              </a>
            </li>
            <li>
              <a href="/markets">
                <i className="icon">🌐</i>
                <span>Markets</span>
              </a>
            </li>
            <li className="active">
              <a href="/profile">
                <i className="icon">👤</i>
                <span>Profile</span>
              </a>
            </li>
          </ul>
        </nav>

        <main className="app-content">
          <ProfilePage username={username} />
        </main>
      </div>
    </div>
  );
};

export default ProfileRoute; 