import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaStar, FaChartLine, FaUser, FaCog } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? '→' : '←'}
      </div>
      
      <ul className="sidebar-menu">
        <li className={isActive('/dashboard')}>
          <Link to="/dashboard">
            <FaHome className="sidebar-icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <li className={isActive('/trades')}>
          <Link to="/trades">
            <FaExchangeAlt className="sidebar-icon" />
            {!isCollapsed && <span>Trades</span>}
          </Link>
        </li>
        <li className={isActive('/watchlist')}>
          <Link to="/watchlist">
            <FaStar className="sidebar-icon" />
            {!isCollapsed && <span>Watchlist</span>}
          </Link>
        </li>
        <li className={location.pathname.startsWith('/orderbook') ? 'active' : ''}>
          <Link to="/orderbook/BTC">
            <FaChartLine className="sidebar-icon" />
            {!isCollapsed && <span>Orderbook</span>}
          </Link>
        </li>
        <li className={isActive('/profile')}>
          <Link to="/profile">
            <FaUser className="sidebar-icon" />
            {!isCollapsed && <span>Profile</span>}
          </Link>
        </li>
        <li className={isActive('/accounts')}>
          <Link to="/accounts">
            <FaUser className="sidebar-icon" />
            {!isCollapsed && <span>Accounts</span>}
          </Link>
        </li>
        <li className={isActive('/settings')}>
          <Link to="/settings">
            <FaCog className="sidebar-icon" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar; 