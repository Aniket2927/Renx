import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaExchangeAlt, 
  FaStar, 
  FaChartLine, 
  FaUser, 
  FaArrowLeft,
  FaArrowRight,
  FaUserCircle
} from 'react-icons/fa';
import '../../styles/Sidebar.css';

const Sidebar = ({ visible }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${visible ? 'visible' : ''}`}>
      <div className="sidebar-toggle" onClick={handleToggleCollapse}>
        {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon"><FaHome /></span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/trades" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon"><FaExchangeAlt /></span>
            {!collapsed && <span>Trades</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/watchlist" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon"><FaStar /></span>
            {!collapsed && <span>Watchlist</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/markets" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon"><FaChartLine /></span>
            {!collapsed && <span>Markets</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon"><FaUser /></span>
            {!collapsed && <span>Profile</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/accounts" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon"><FaUserCircle /></span>
            {!collapsed && <span>Accounts</span>}
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 