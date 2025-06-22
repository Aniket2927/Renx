import React from 'react';
import ProfileSection from '../components/profile/ProfileSection';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaChevronRight } from 'react-icons/fa';
import '../styles/Profile.css';

const Profile = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading profile...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="error-container">
        <FaUserCircle size={50} color="#e53e3e" />
        <div>User not found. Please log in.</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <FaChevronRight size={12} />
          <span className="current">My Profile</span>
        </div>
        <h1>My Profile</h1>
      </header>
      <ProfileSection user={user} />
    </div>
  );
};

export default Profile; 