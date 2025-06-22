import React, { useState, useEffect } from 'react';
import './ProfileSection.css';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, FaPencilAlt } from 'react-icons/fa';

const ProfileSection = () => {
  // Mock user data - in a real app, this would come from an API
  const [userData, setUserData] = useState({
    username: 'JohnTrader',
    email: 'john.trader@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1 (555) 123-4567',
    address: '123 Trading Street, Market City, TC 12345',
    profileImage: 'https://i.pravatar.cc/150?img=68', // placeholder image
    joinDate: '2023-01-15',
    tradingExperience: 'Intermediate',
    bio: 'Passionate crypto trader with 5 years of experience in market analysis and algorithmic trading.'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...userData});
  const [activeTab, setActiveTab] = useState('profile');
  const [notification, setNotification] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to an API
    setUserData({...formData});
    setIsEditing(false);
    showNotification('Profile updated successfully!');
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset form data to current user data
      setFormData({...userData});
    }
    setIsEditing(!isEditing);
  };

  // Show notification message
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // Here we're just creating a local URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-section">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <div className="profile-header">
        <h2>My Profile</h2>
        <button 
          className={`edit-button ${isEditing ? 'save-mode' : ''}`} 
          onClick={isEditing ? handleSubmit : toggleEditMode}
        >
          {isEditing ? <><FaSave /> Save</> : <><FaPencilAlt /> Edit</>}
        </button>
        {isEditing && (
          <button className="cancel-button" onClick={toggleEditMode}>
            Cancel
          </button>
        )}
      </div>

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          Personal Info
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''} 
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          className={activeTab === 'preferences' ? 'active' : ''} 
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button 
          className={activeTab === 'verification' ? 'active' : ''} 
          onClick={() => setActiveTab('verification')}
        >
          Verification
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-info">
            <div className="profile-image-container">
              <img 
                src={formData.profileImage} 
                alt="Profile" 
                className="profile-image" 
              />
              {isEditing && (
                <label className="image-upload-label">
                  <FaCamera />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="image-upload-input" 
                  />
                </label>
              )}
            </div>

            <div className="profile-details">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label><FaUser /> Username</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                      />
                    ) : (
                      <p>{userData.username}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label><FaEnvelope /> Email</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                      />
                    ) : (
                      <p>{userData.email}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FaIdCard /> First Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                      />
                    ) : (
                      <p>{userData.firstName}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label><FaIdCard /> Last Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                      />
                    ) : (
                      <p>{userData.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FaPhone /> Phone</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                      />
                    ) : (
                      <p>{userData.phone}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label><FaMapMarkerAlt /> Address</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                      />
                    ) : (
                      <p>{userData.address}</p>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Trading Experience</label>
                  {isEditing ? (
                    <select 
                      name="tradingExperience" 
                      value={formData.tradingExperience} 
                      onChange={handleChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  ) : (
                    <p>{userData.tradingExperience}</p>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  {isEditing ? (
                    <textarea 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleChange} 
                      rows="4"
                    />
                  ) : (
                    <p>{userData.bio}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Member Since</label>
                  <p>{new Date(userData.joinDate).toLocaleDateString()}</p>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <h3><FaLock /> Security Settings</h3>
            <div className="security-option">
              <div className="security-info">
                <h4>Password</h4>
                <p>Last changed: 30 days ago</p>
              </div>
              <button className="change-button">Change Password</button>
            </div>
            <div className="security-option">
              <div className="security-info">
                <h4>Two-Factor Authentication</h4>
                <p>Status: Not Enabled</p>
              </div>
              <button className="enable-button">Enable 2FA</button>
            </div>
            <div className="security-option">
              <div className="security-info">
                <h4>Login History</h4>
                <p>Track your account sign-ins</p>
              </div>
              <button className="view-button">View History</button>
            </div>
            <div className="security-option">
              <div className="security-info">
                <h4>API Keys</h4>
                <p>Manage your API access</p>
              </div>
              <button className="manage-button">Manage Keys</button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h3>Preferences</h3>
            <div className="preference-option">
              <div className="preference-info">
                <h4>Notification Settings</h4>
                <p>Manage how you receive alerts</p>
              </div>
              <button className="settings-button">Configure</button>
            </div>
            <div className="preference-option">
              <div className="preference-info">
                <h4>Display Settings</h4>
                <p>Customize your trading interface</p>
              </div>
              <button className="settings-button">Customize</button>
            </div>
            <div className="preference-option">
              <div className="preference-info">
                <h4>Language</h4>
                <p>Current: English</p>
              </div>
              <button className="settings-button">Change</button>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="verification-section">
            <h3>Account Verification</h3>
            <div className="verification-status">
              <h4>Current Verification Level: Level 1</h4>
              <p>Higher verification levels allow for increased trading limits and features.</p>
            </div>
            <div className="verification-steps">
              <div className="verification-step completed">
                <div className="step-number">1</div>
                <div className="step-info">
                  <h4>Email Verification</h4>
                  <p>Status: Verified</p>
                </div>
                <div className="step-status">✓</div>
              </div>
              <div className="verification-step">
                <div className="step-number">2</div>
                <div className="step-info">
                  <h4>Identity Verification</h4>
                  <p>Status: Not Completed</p>
                </div>
                <button className="verify-button">Verify Now</button>
              </div>
              <div className="verification-step">
                <div className="step-number">3</div>
                <div className="step-info">
                  <h4>Address Verification</h4>
                  <p>Status: Not Completed</p>
                </div>
                <button className="verify-button" disabled>Verify Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection; 