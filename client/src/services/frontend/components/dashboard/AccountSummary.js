import React from 'react';
import { Link } from 'react-router-dom';

const AccountSummary = ({ user }) => {
  return (
    <div className="account-summary-container">
      <h3>Account Summary</h3>
      
      <div className="account-balance">
        <div className="balance-label">Available Balance</div>
        <div className="balance-amount">${user?.balance?.toFixed(2) || '0.00'}</div>
        <button className="deposit-btn">Deposit Funds</button>
      </div>
      
      <div className="account-info">
        <div className="info-item">
          <span className="info-label">Account Type</span>
          <span className="info-value">{user?.role || 'User'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Account Status</span>
          <span className="info-value status-active">Active</span>
        </div>
        <div className="info-item">
          <span className="info-label">Member Since</span>
          <span className="info-value">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
      
      <Link to="/profile" className="view-profile-link">View Full Profile</Link>
    </div>
  );
};

export default AccountSummary; 