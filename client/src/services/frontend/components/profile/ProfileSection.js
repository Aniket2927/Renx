import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaShieldAlt, 
  FaCreditCard, 
  FaRobot, 
  FaStar, 
  FaUserFriends, 
  FaExchangeAlt, 
  FaHistory,
  FaBell,
  FaLock,
  FaKey,
  FaSignOutAlt,
  FaTrash,
  FaCheck,
  FaEdit,
  FaCopy,
  FaShare,
  FaSliders,
  FaPlus,
  FaMinus,
  FaChartLine,
  FaPercent,
  FaExclamationTriangle,
  FaBrain
} from 'react-icons/fa';
import '../../styles/Profile.css';

const securitySettings = {
  password: { lastChanged: '2023-08-15', strength: 'Strong' },
  twoFactor: { enabled: true, type: 'Authenticator app' },
  loginHistory: [
    { date: '2023-09-15 14:23', ip: '192.168.1.1', location: 'New York, USA', device: 'Chrome / Windows' },
    { date: '2023-09-14 09:45', ip: '192.168.1.1', location: 'New York, USA', device: 'Mobile / iOS' }
  ]
};

const ProfileSection = ({ user }) => {
  // Default user object if user prop is null
  const defaultUser = {
    username: 'Demo User',
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+1 555-123-4567',
    location: 'New York, USA',
    bio: 'I am a trader using RenX platform.',
    balance: 10000,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  // Use the provided user or fall back to default
  const userData = user || defaultUser;
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [twoFAStatus, setTwoFAStatus] = useState(securitySettings.twoFactor.enabled);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockName, setNewStockName] = useState("");
  const [addStockError, setAddStockError] = useState("");
  
  // Document upload state variables
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentType, setDocumentType] = useState('id');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [documentError, setDocumentError] = useState("");
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentSuccess, setDocumentSuccess] = useState("");
  const [documentDetails, setDocumentDetails] = useState({
    id: { number: '', name: '', dateOfBirth: '', issueDate: '', expiryDate: '' },
    address: { address1: '', address2: '', city: '', state: '', postalCode: '', country: '' },
    pan: { number: '', name: '', dateOfBirth: '' },
    passport: { number: '', name: '', nationality: '', dateOfBirth: '', issueDate: '', expiryDate: '' },
    driving: { number: '', name: '', issueDate: '', expiryDate: '', issuingAuthority: '' },
    tax: { number: '', name: '', taxYear: '' }
  });
  const [uploadedDocuments, setUploadedDocuments] = useState({
    id: { status: 'pending', fileName: 'WhatsApp Image 2025-06-07 at 4.44.45 PM.jpeg', uploadDate: '2025-06-12', docType: 'National ID', details: { number: 'ID123456789', name: 'John Doe', dateOfBirth: '1990-01-01' } },
    address: { status: 'pending', fileName: 'images-removebg-preview.png', uploadDate: '2025-06-12', docType: 'Utility Bill', details: { address1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' } },
    pan: { status: 'not_uploaded', fileName: '', uploadDate: '', docType: '', details: {} },
    passport: { status: 'not_uploaded', fileName: '', uploadDate: '', docType: '', details: {} },
    driving: { status: 'not_uploaded', fileName: '', uploadDate: '', docType: '', details: {} },
    tax: { status: 'not_uploaded', fileName: '', uploadDate: '', docType: '', details: {} }
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentSubType, setDocumentSubType] = useState('');
  
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    name: userData?.name || userData?.username || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    location: userData?.location || '',
    bio: userData?.bio || 'I am a trader using RenX platform.'
  });

  // KYC verification levels
  const kycLevels = [
    { id: 'level1', name: 'Level 1', status: 'verified', description: 'Basic identity verification', limits: 'Daily limit: $1,000' },
    { id: 'level2', name: 'Level 2', status: 'verified', description: 'Address verification', limits: 'Daily limit: $10,000' },
    { id: 'level3', name: 'Level 3', status: 'pending', description: 'Enhanced due diligence', limits: 'Daily limit: $100,000' }
  ];

  // Subscription plans
  const subscriptionPlans = [
    { id: 'free', name: 'Free', price: '$0', features: ['Basic trading features', 'Market data (delayed)', 'Standard indicators', 'Email support'] },
    { id: 'pro', name: 'Pro', price: '$29.99/mo', features: ['Real-time market data', 'Advanced indicators', 'Trading bots (2)', 'Priority support'], isActive: true },
    { id: 'elite', name: 'Elite', price: '$99.99/mo', features: ['Custom AI models', 'Unlimited trading bots', 'API access', 'Dedicated account manager'] }
  ];

  // AI model settings
  const [aiSettings, setAiSettings] = useState({
    riskTolerance: 50,
    tradingFrequency: 'medium',
    confidenceThreshold: 65,
    preferredStrategy: 'momentum',
    strategies: {
      momentum: true,
      swing: false,
      intraday: true,
      value: false
    }
  });

  // Connected brokers
  const connectedBrokers = [
    { id: 'zerodha', name: 'Zerodha', status: 'connected', lastSync: '15 mins ago', apiStatus: 'Active' },
    { id: 'upstox', name: 'Upstox', status: 'connected', lastSync: '2 hours ago', apiStatus: 'Active' },
    { id: 'fyers', name: 'Fyers', status: 'disconnected', apiStatus: 'Inactive' }
  ];

  // Watchlist items
  const [watchlistItems, setWatchlistItems] = useState([
    { symbol: 'AAPL', name: 'Apple Inc', alerts: [
      { type: 'price', value: 180, direction: 'above', enabled: true },
      { type: 'volume', value: '1000000', enabled: true }
    ], aiAlerts: true },
    { symbol: 'TSLA', name: 'Tesla Inc', alerts: [
      { type: 'price', value: 200, direction: 'below', enabled: true }
    ], aiAlerts: false },
    { symbol: 'MSFT', name: 'Microsoft Corp', alerts: [], aiAlerts: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc', alerts: [
      { type: 'rsi', value: 70, direction: 'above', enabled: true },
      { type: 'macd', value: 0, direction: 'crossover', enabled: true },
      { type: 'price', value: 130, direction: 'below', enabled: false }
    ], aiAlerts: true }
  ]);

  // Referral stats
  const referralStats = {
    code: 'RenX-1234-ABCD',
    invites: 8,
    signups: 5,
    earnings: '$75.00',
    pendingEarnings: '$45.00'
  };

  // AI model feedback history
  const aiTrainingHistory = [
    { date: '2023-09-10', model: 'Trend Follower', accuracy: '82%', tradesAnalyzed: 42, feedback: 'Good predictions but sometimes late to react' },
    { date: '2023-09-05', model: 'Volatility Predictor', accuracy: '76%', tradesAnalyzed: 38, feedback: 'Needs improvement during high volatility' },
    { date: '2023-08-25', model: 'Momentum Scanner', accuracy: '88%', tradesAnalyzed: 57, feedback: 'Excellent momentum signals' }
  ];

  // New state variables
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeSymbol, setRemoveSymbol] = useState(null);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [alertsSymbol, setAlertsSymbol] = useState(null);
  const [alertType, setAlertType] = useState('price');
  const [alertValue, setAlertValue] = useState('');
  const [alertError, setAlertError] = useState('');

  // Add state for account and plan modals and logic
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [accountActive, setAccountActive] = useState(true);
  const [plan, setPlan] = useState('Pro');
  const [planAction, setPlanAction] = useState('');
  const [planError, setPlanError] = useState('');
  const [accountAction, setAccountAction] = useState('');
  const [accountError, setAccountError] = useState('');

  // New state variables for referral section
  const [copySuccess, setCopySuccess] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const referralLink = `https://renx.ai/ref/${referralStats.code}`;

  // New state variables for plan confirmation
  const [showPlanConfirmModal, setShowPlanConfirmModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState("");
  const [planMessage, setPlanMessage] = useState("");
  const [planProcessing, setPlanProcessing] = useState(false);

  // Add these state variables and handlers at the top level of the ProfileSection component
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInfo, setEditInfo] = useState({...personalInfo});
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycLevel, setKycLevel] = useState(null);

  // 1. Add state for broker actions and modals at the top of the component
  const [brokerAction, setBrokerAction] = useState({ id: null, type: null });
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [brokerModalError, setBrokerModalError] = useState("");
  const [brokerModalProcessing, setBrokerModalProcessing] = useState(false);
  const [brokerForm, setBrokerForm] = useState({ name: '', apiKey: '', apiSecret: '' });
  const [brokerFeedback, setBrokerFeedback] = useState("");
  const [brokers, setBrokers] = useState(connectedBrokers);

  // Add at the top of the component:
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState("");

  // Fetch user info on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      setProfileFetchError("");
      try {
        // Replace userId with actual user id from props/context
        const response = await fetch(`http://localhost:4000/api/profile/${userData.id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setPersonalInfo(data);
      } catch (err) {
        setProfileFetchError("Failed to load profile info.");
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // 2. Handler functions
  const handleSyncBroker = (id) => {
    setBrokerFeedback("");
    setBrokerModalProcessing(true);
    setTimeout(() => {
      setBrokers(prev => prev.map(b => b.id === id ? { ...b, lastSync: 'Just now' } : b));
      setBrokerModalProcessing(false);
      setBrokerFeedback('Broker synced successfully!');
      setTimeout(()=>setBrokerFeedback(''), 1500);
    }, 1200);
  };
  const handleConnectBroker = (id) => {
    setBrokerFeedback("");
    setBrokerModalProcessing(true);
    setTimeout(() => {
      setBrokers(prev => prev.map(b => b.id === id ? { ...b, status: 'connected', apiStatus: 'Active', lastSync: 'Just now' } : b));
      setBrokerModalProcessing(false);
      setBrokerFeedback('Broker connected!');
      setTimeout(()=>setBrokerFeedback(''), 1500);
    }, 1200);
  };
  const handleDisconnectBroker = (id) => {
    setBrokerFeedback("");
    setBrokerModalProcessing(true);
    setTimeout(() => {
      setBrokers(prev => prev.map(b => b.id === id ? { ...b, status: 'disconnected', apiStatus: 'Inactive' } : b));
      setBrokerModalProcessing(false);
      setBrokerFeedback('Broker disconnected.');
      setTimeout(()=>setBrokerFeedback(''), 1500);
    }, 1200);
  };
  const openBrokerModal = () => {
    setBrokerForm({ name: '', apiKey: '', apiSecret: '' });
    setBrokerModalError("");
    setBrokerModalOpen(true);
  };
  const handleBrokerFormChange = (e) => {
    setBrokerForm({ ...brokerForm, [e.target.name]: e.target.value });
    setBrokerModalError("");
  };
  const handleAddBroker = () => {
    if (!brokerForm.name.trim() || !brokerForm.apiKey.trim() || !brokerForm.apiSecret.trim()) {
      setBrokerModalError('All fields are required.');
      return;
    }
    setBrokerModalProcessing(true);
    setTimeout(() => {
      setBrokers(prev => [...prev, {
        id: brokerForm.name.toLowerCase(),
        name: brokerForm.name,
        status: 'connected',
        lastSync: 'Just now',
        apiStatus: 'Active'
      }]);
      setBrokerModalProcessing(false);
      setBrokerModalOpen(false);
      setBrokerFeedback('Broker added and connected!');
      setTimeout(()=>setBrokerFeedback(''), 1500);
    }, 1200);
  };

  const handleEditInfo = async () => {
    if (!editInfo.name.trim() || !editInfo.email.trim()) {
      setEditError("Name and Email are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(editInfo.email)) {
      setEditError("Invalid email address.");
      return;
    }
    try {
      setEditError("");
      setEditSuccess("");
      setLoadingProfile(true);
      // Replace userId with actual user id from props/context
      const response = await fetch(`http://localhost:4000/api/profile/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editInfo),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updated = await response.json();
      setPersonalInfo(updated);
      setEditSuccess("Information updated!");
      setTimeout(() => { setEditSuccess(""); setShowEditModal(false); }, 1200);
    } catch (err) {
      setEditError("Failed to update profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  };
  const handleKYCCheck = (level) => {
    setKycLevel(level);
    setShowKYCModal(true);
  };

  // Event handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePersonalInfoSave = (e) => {
    e.preventDefault();
    // Here you would typically send an API request to update the user info
    console.log('Saving personal info:', personalInfo);
    setIsEditing(false);
  };

  const handleTradingFrequencyChange = (frequency) => {
    setAiSettings(prev => ({
      ...prev,
      tradingFrequency: frequency
    }));
  };

  const toggleAIAlerts = (symbol) => {
    setWatchlistItems(prev => 
      prev.map(item => 
        item.symbol === symbol 
          ? { ...item, aiAlerts: !item.aiAlerts } 
          : item
      )
    );
  };

  const toggleAlertEnabled = (symbol, alertIndex) => {
    setWatchlistItems(prev => 
      prev.map(item => 
        item.symbol === symbol 
          ? { 
              ...item, 
              alerts: item.alerts.map((alert, idx) => 
                idx === alertIndex 
                  ? { ...alert, enabled: !alert.enabled } 
                  : alert
              ) 
            } 
          : item
      )
    );
  };

  const removeAlertFromWatchlistItem = (symbol, alertIndex) => {
    setWatchlistItems(prev => 
      prev.map(item => 
        item.symbol === symbol 
          ? { 
              ...item, 
              alerts: item.alerts.filter((_, idx) => idx !== alertIndex) 
            } 
          : item
      )
    );
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlistItems(prev => prev.filter(item => item.symbol !== symbol));
  };

  const validateStockInputs = () => {
    if (!newStockSymbol.trim() || !newStockName.trim()) {
      setAddStockError("Both fields are required.");
      return false;
    }
    if (!/^[A-Z0-9]{1,6}$/.test(newStockSymbol.trim().toUpperCase())) {
      setAddStockError("Symbol must be 1-6 uppercase letters or numbers.");
      return false;
    }
    setAddStockError("");
    return true;
  };

  const handleAddStock = () => {
    if (!validateStockInputs()) return;
    setWatchlistItems(prev => [
      ...prev,
      { symbol: newStockSymbol.trim().toUpperCase(), name: newStockName.trim(), alerts: [], aiAlerts: false }
    ]);
    setShowAddStockModal(false);
    setNewStockSymbol("");
    setNewStockName("");
    setAddStockError("");
  };

  const handleRemoveClick = (symbol) => {
    setRemoveSymbol(symbol);
    setShowRemoveModal(true);
  };
  const confirmRemove = () => {
    setWatchlistItems(prev => prev.filter(item => item.symbol !== removeSymbol));
    setShowRemoveModal(false);
    setRemoveSymbol(null);
  };
  const cancelRemove = () => {
    setShowRemoveModal(false);
    setRemoveSymbol(null);
  };

  const handleAlertsClick = (symbol) => {
    setAlertsSymbol(symbol);
    setShowAlertsModal(true);
    setAlertType('price');
    setAlertValue('');
    setAlertError('');
  };
  const handleAddAlert = () => {
    if (!alertValue.trim() || isNaN(alertValue)) {
      setAlertError('Please enter a valid number for alert value.');
      return;
    }
    setWatchlistItems(prev => prev.map(item =>
      item.symbol === alertsSymbol
        ? { ...item, alerts: [...item.alerts, { type: alertType, value: parseFloat(alertValue), enabled: true }] }
        : item
    ));
    setShowAlertsModal(false);
    setAlertsSymbol(null);
    setAlertValue('');
    setAlertError('');
  };
  const cancelAlerts = () => {
    setShowAlertsModal(false);
    setAlertsSymbol(null);
    setAlertValue('');
    setAlertError('');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError("");
    setShowPasswordModal(false);
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    // Add your password change logic here
  };
  const handle2FAToggle = () => {
    setTwoFAStatus(!twoFAStatus);
    setShow2FAModal(false);
    // Add your 2FA logic here
  };
  const handleDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type DELETE to confirm.');
      return;
    }
    setDeleteError("");
    setShowDeleteAccountModal(false);
    setDeleteConfirm("");
    // Add your delete logic here
  };

  // Document upload handler functions
  const handleDocumentTypeChange = (type) => {
    setDocumentType(type);
    setDocumentError("");
    setDocumentSubType('');
  };

  const handleDocumentSubTypeChange = (e) => {
    setDocumentSubType(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setDocumentError("Only JPG, PNG, and PDF files are allowed.");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setDocumentError("File size should not exceed 5MB.");
      return;
    }
    
    setDocumentFile(file);
    setDocumentError("");
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF files, show a generic PDF icon
      setDocumentPreview("pdf");
    }
  };

  const handleDocumentDetailChange = (field, value) => {
    setDocumentDetails(prev => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        [field]: value
      }
    }));
  };

  const validateDocumentDetails = () => {
    const details = documentDetails[documentType];
    let isValid = true;
    let errorMessage = "";

    // Common validation for most document types
    if (documentType === 'id' || documentType === 'pan' || documentType === 'passport' || documentType === 'driving') {
      if (!details.number?.trim()) {
        isValid = false;
        errorMessage = "Document number is required";
      } else if (!details.name?.trim()) {
        isValid = false;
        errorMessage = "Name is required";
      }
    }

    // Specific validations
    if (documentType === 'id' || documentType === 'passport' || documentType === 'pan') {
      if (!details.dateOfBirth?.trim()) {
        isValid = false;
        errorMessage = "Date of birth is required";
      }
    }

    if (documentType === 'id' || documentType === 'passport' || documentType === 'driving') {
      if (!details.expiryDate?.trim()) {
        isValid = false;
        errorMessage = "Expiry date is required";
      }
    }

    if (documentType === 'address') {
      if (!details.address1?.trim()) {
        isValid = false;
        errorMessage = "Address is required";
      } else if (!details.city?.trim()) {
        isValid = false;
        errorMessage = "City is required";
      } else if (!details.postalCode?.trim()) {
        isValid = false;
        errorMessage = "Postal code is required";
      } else if (!details.country?.trim()) {
        isValid = false;
        errorMessage = "Country is required";
      }
    }

    if (documentType === 'tax') {
      if (!details.number?.trim()) {
        isValid = false;
        errorMessage = "Tax ID number is required";
      } else if (!details.taxYear?.trim()) {
        isValid = false;
        errorMessage = "Tax year is required";
      }
    }

    setDocumentError(errorMessage);
    return isValid;
  };

  const handleDocumentUpload = () => {
    if (!documentFile) {
      setDocumentError("Please select a file to upload.");
      return;
    }

    if (!documentSubType && (documentType === 'id' || documentType === 'address')) {
      setDocumentError("Please select document type.");
      return;
    }

    if (!validateDocumentDetails()) {
      return;
    }
    
    setDocumentUploading(true);
    setDocumentError("");
    
    // Simulate upload process
    setTimeout(() => {
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: {
          status: 'pending',
          fileName: documentFile.name,
          uploadDate: new Date().toISOString().split('T')[0],
          docType: documentSubType || getDocumentTypeName(documentType),
          details: documentDetails[documentType]
        }
      }));
      
      setDocumentUploading(false);
      setDocumentSuccess("Document uploaded successfully! It is now pending verification.");
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setDocumentSuccess("");
        setShowDocumentModal(false);
        setDocumentFile(null);
        setDocumentPreview(null);
        setDocumentSubType('');
      }, 2000);
    }, 1500);
  };

  const openDocumentModal = (type) => {
    setDocumentType(type);
    setDocumentFile(null);
    setDocumentPreview(null);
    setDocumentError("");
    setDocumentSuccess("");
    setDocumentSubType('');
    setShowDocumentModal(true);
  };

  const openDocumentDetails = (type) => {
    setSelectedDocument(type);
    setShowDetailsModal(true);
  };

  const getDocumentTypeName = (type) => {
    const typeMap = {
      'id': 'National ID',
      'address': 'Proof of Address',
      'pan': 'PAN Card',
      'passport': 'Passport',
      'driving': 'Driving License',
      'tax': 'Tax Document'
    };
    return typeMap[type] || type;
  };

  const getDocumentSubTypes = (type) => {
    const subtypeMap = {
      'id': [
        { value: 'National ID', label: 'National ID' },
        { value: 'Passport', label: 'Passport' },
        { value: 'Driver\'s License', label: 'Driver\'s License' }
      ],
      'address': [
        { value: 'Utility Bill', label: 'Utility Bill' },
        { value: 'Bank Statement', label: 'Bank Statement' },
        { value: 'Phone/Internet Bill', label: 'Phone/Internet Bill' },
        { value: 'Rental Agreement', label: 'Rental Agreement' }
      ]
    };
    return subtypeMap[type] || [];
  };

  const handleAccountAction = (action) => {
    setAccountAction(action);
    setAccountError('');
  };
  const confirmAccountAction = () => {
    if (accountAction === 'deactivate') {
      setAccountActive(false);
    } else if (accountAction === 'activate') {
      setAccountActive(true);
    }
    setShowAccountModal(false);
    setAccountAction('');
  };
  const handlePlanAction = (action) => {
    setPlanAction(action);
    setPlanError('');
  };
  const confirmPlanAction = () => {
    if (planAction === 'cancel') {
      setPlan('Free');
    } else if (planAction === 'upgrade') {
      setPlan('Pro');
    }
    setShowPlanModal(false);
    setPlanAction('');
  };

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopySuccess("Copied!");
    setTimeout(()=>setCopySuccess(""), 1500);
  };
  const handleEmailShare = () => {
    if (!referralLink) return;
    window.location.href = `mailto:?subject=Join%20RenX!&body=Sign%20up%20with%20my%20referral%20link:%20${encodeURIComponent(referralLink)}`;
  };

  const handlePlanChange = (planType) => {
    setPendingPlan(planType);
    setShowPlanConfirmModal(true);
    setPlanMessage("");
  };
  const confirmPlanChange = () => {
    setPlanProcessing(true);
    setTimeout(() => {
      setPlan(pendingPlan);
      setShowPlanConfirmModal(false);
      setPlanProcessing(false);
      setPlanMessage(`Your plan has been changed to ${pendingPlan}.`);
      setTimeout(()=>setPlanMessage(""), 2000);
    }, 1200);
  };

  // Add state for AI settings feedback and error
  const [aiSettingsError, setAiSettingsError] = useState("");
  const [aiSettingsSuccess, setAiSettingsSuccess] = useState("");
  const [aiSettingsDraft, setAiSettingsDraft] = useState(aiSettings);
  const handleRiskToleranceChange = (e) => {
    setAiSettingsDraft(prev => ({ ...prev, riskTolerance: parseInt(e.target.value) }));
    setAiSettingsError("");
  };
  const handleConfidenceThresholdChange = (e) => {
    setAiSettingsDraft(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }));
    setAiSettingsError("");
  };
  const handlePreferredStrategyChange = (strategy) => {
    setAiSettingsDraft(prev => ({ ...prev, preferredStrategy: strategy }));
    setAiSettingsError("");
  };
  const handleSaveAISettings = () => {
    if (aiSettingsDraft.riskTolerance < 0 || aiSettingsDraft.riskTolerance > 100) {
      setAiSettingsError('Risk tolerance must be between 0 and 100.');
      return;
    }
    if (aiSettingsDraft.confidenceThreshold < 50 || aiSettingsDraft.confidenceThreshold > 95) {
      setAiSettingsError('Confidence threshold must be between 50% and 95%.');
      return;
    }
    if (!aiSettingsDraft.preferredStrategy) {
      setAiSettingsError('Please select a preferred AI strategy.');
      return;
    }
    setAiSettings(aiSettingsDraft);
    setAiSettingsSuccess('AI settings saved!');
    setTimeout(()=>setAiSettingsSuccess(''), 1500);
  };
  const handleResetAISettings = () => {
    setAiSettingsDraft({
      riskTolerance: 50,
      tradingFrequency: 'medium',
      confidenceThreshold: 65,
      preferredStrategy: 'momentum',
      strategies: {
        momentum: true,
        swing: false,
        intraday: true,
        value: false
      }
    });
    setAiSettingsError("");
    setAiSettingsSuccess('Settings reset to default.');
    setTimeout(()=>setAiSettingsSuccess(''), 1200);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="profile-tab-content">
            <h3>Personal Information</h3>
            <div className="profile-info-display">
              <div className="info-row">
                <div className="info-group">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{personalInfo.name}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{personalInfo.email}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-group">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{personalInfo.phone || 'Not provided'}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{personalInfo.location || 'Not provided'}</span>
                </div>
              </div>
              <div className="info-group full-width">
                <span className="info-label">Bio:</span>
                <span className="info-value bio">{personalInfo.bio}</span>
              </div>
              <button className="edit-btn" onClick={()=>{setEditInfo({...personalInfo});setShowEditModal(true);}} style={{display:'flex',alignItems:'center',gap:8,marginTop:18,padding:'10px 18px',background:'#f2f2f2',border:'none',borderRadius:8,fontWeight:500,fontSize:16,cursor:'pointer'}}>
                {/* Pencil SVG */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect width="22" height="22" rx="6" fill="#e3eaf3"/><path d="M6 16l2.5-.5 7-7a1.5 1.5 0 0 0-2-2l-7 7L6 16z" stroke="#7B8A8B" strokeWidth="1.5"/></svg>
                Edit Information
              </button>
            </div>
            
            <div className="kyc-verification">
              <h3>KYC Verification</h3>
              <div className="kyc-levels">
                {kycLevels.map(level => (
                  <div key={level.id} className={`kyc-level ${level.status}`} style={{border: level.status==='pending'?'2px solid #ffd700':level.status==='verified'?'2px solid #b6e6c9':'1px solid #eee', background: '#fff', borderRadius: 12, padding: 24, marginBottom: 0, boxShadow:level.status==='pending'?'0 0 0 2px #fff, 0 0 0 4px #ffd70033':''}}>
                    <div className="level-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <h4>{level.name}</h4>
                      <span className="status-badge" style={{background:level.status==='verified'?'#d4f5df':level.status==='pending'?'#fff7e0':'#eee',color:level.status==='verified'?'#218838':level.status==='pending'?'#e6a700':'#888',borderRadius:8,padding:'4px 12px',fontSize:13,marginLeft:8}}>{level.status.charAt(0).toUpperCase()+level.status.slice(1)}</span>
                    </div>
                    <p className="level-description">{level.description}</p>
                    <p className="level-limits">{level.limits}</p>
                    {level.status==='pending' && (
                      <button onClick={()=>handleKYCCheck(level)} style={{width:'100%',padding:'13px 0',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16,cursor:'pointer',marginTop:10}}>Check Status</button>
                    )}
                    {level.status!=='verified' && level.status!=='pending' && (
                      <button onClick={()=>handleKYCCheck(level)} style={{width:'100%',padding:'13px 0',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16,cursor:'pointer',marginTop:10}}>Verify Now</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Document Upload Section */}
            <div className="document-upload-section">
              <h3>Upload Documents</h3>
              <p className="section-description">To finalize your trading account application, we are required to verify your identity.</p>
              
              <div className="document-categories">
                <div className="document-category">
                  <h4 className="category-title">Identity Documents</h4>
                  <div className="document-grid">
                    <div className="document-card" style={{background:'white', borderRadius:12, padding:24, border: uploadedDocuments.id.status === 'pending' ? '2px solid #ffd700' : uploadedDocuments.id.status === 'verified' ? '2px solid #b6e6c9' : '1px solid #eee'}}>
                      <div className="document-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div className="document-icon-title">
                          <div className="document-icon" style={{background:'#e3f7ff', width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#4776E6" strokeWidth="2" />
                              <circle cx="12" cy="10" r="3" stroke="#4776E6" strokeWidth="2" />
                              <path d="M17.5 17.5c-1.5-2-3.27-3-5.5-3-2.24 0-4 1-5.5 3" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h4 style={{margin:0, fontSize:18, fontWeight:600}}>Government Photo ID</h4>
                        </div>
                        <div className="document-status">
                          <span style={{background: uploadedDocuments.id.status === 'verified' ? '#d4f5df' : uploadedDocuments.id.status === 'pending' ? '#fff7e0' : '#eee', color: uploadedDocuments.id.status === 'verified' ? '#218838' : uploadedDocuments.id.status === 'pending' ? '#e6a700' : '#888', borderRadius:8, padding:'4px 12px', fontSize:13}}>
                            {uploadedDocuments.id.status === 'verified' ? 'Verified' : uploadedDocuments.id.status === 'pending' ? 'Pending' : 'Not Uploaded'}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{margin:'0 0 12px 0', color:'#666', fontSize:14}}>
                        e.g. Passport, National ID, Driver's License
                      </p>
                      
                      {uploadedDocuments.id.status !== 'not_uploaded' && (
                        <>
                          <div className="file-info" style={{display:'flex', alignItems:'center', marginBottom:12, background:'#f5f8fc', padding:'8px 12px', borderRadius:6}}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight:8, flexShrink:0}}>
                              <path d="M4 14h8a2 2 0 002-2V6L10 2H4a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 2v4h4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{fontSize:14, wordBreak:'break-all'}}>{uploadedDocuments.id.fileName}</span>
                          </div>
                          <div className="document-info" style={{fontSize:14, color:'#666', marginBottom:12}}>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Type:</span> 
                              <span>{uploadedDocuments.id.docType}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Uploaded:</span> 
                              <span>{uploadedDocuments.id.uploadDate}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>ID Number:</span> 
                              <span>{uploadedDocuments.id.details?.number || 'Not provided'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => openDocumentDetails('id')} 
                            style={{background:'transparent', border:'none', color:'#4776E6', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', padding:0, marginBottom:16}}
                          >
                            View all details
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:4}}>
                              <path d="M6 12l4-4-4-4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => openDocumentModal('id')} 
                        style={{
                          width:'100%', 
                          padding:'12px 0', 
                          background: uploadedDocuments.id.status === 'verified' ? '#f5f8fc' : '#4776E6', 
                          color: uploadedDocuments.id.status === 'verified' ? '#4776E6' : '#fff', 
                          border: uploadedDocuments.id.status === 'verified' ? '1px solid #4776E6' : 'none', 
                          borderRadius:6, 
                          fontWeight:600, 
                          fontSize:15, 
                          cursor:'pointer'
                        }}
                      >
                        {uploadedDocuments.id.status === 'verified' ? 'Re-upload' : uploadedDocuments.id.status === 'pending' ? 'Replace Document' : 'Upload Document'}
                      </button>
                    </div>
                    
                    <div className="document-card" style={{background:'white', borderRadius:12, padding:24, border: uploadedDocuments.address.status === 'pending' ? '2px solid #ffd700' : uploadedDocuments.address.status === 'verified' ? '2px solid #b6e6c9' : '1px solid #eee'}}>
                      <div className="document-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div className="document-icon-title">
                          <div className="document-icon" style={{background:'#fff0e0', width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 22V12h6v10" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <h4 style={{margin:0, fontSize:18, fontWeight:600}}>Proof Of Residence</h4>
                        </div>
                        <div className="document-status">
                          <span style={{background: uploadedDocuments.address.status === 'verified' ? '#d4f5df' : uploadedDocuments.address.status === 'pending' ? '#fff7e0' : '#eee', color: uploadedDocuments.address.status === 'verified' ? '#218838' : uploadedDocuments.address.status === 'pending' ? '#e6a700' : '#888', borderRadius:8, padding:'4px 12px', fontSize:13}}>
                            {uploadedDocuments.address.status === 'verified' ? 'Verified' : uploadedDocuments.address.status === 'pending' ? 'Pending' : 'Not Uploaded'}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{margin:'0 0 12px 0', color:'#666', fontSize:14}}>
                        e.g. Utility bill, Phone/Internet Bill, Bank Statement
                      </p>
                      
                      {uploadedDocuments.address.status !== 'not_uploaded' && (
                        <>
                          <div className="file-info" style={{display:'flex', alignItems:'center', marginBottom:12, background:'#f5f8fc', padding:'8px 12px', borderRadius:6}}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight:8, flexShrink:0}}>
                              <path d="M4 14h8a2 2 0 002-2V6L10 2H4a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 2v4h4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{fontSize:14, wordBreak:'break-all'}}>{uploadedDocuments.address.fileName}</span>
                          </div>
                          <div className="document-info" style={{fontSize:14, color:'#666', marginBottom:12}}>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Type:</span> 
                              <span>{uploadedDocuments.address.docType}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Uploaded:</span> 
                              <span>{uploadedDocuments.address.uploadDate}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Address:</span> 
                              <span>{uploadedDocuments.address.details?.address1 || 'Not provided'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => openDocumentDetails('address')} 
                            style={{background:'transparent', border:'none', color:'#4776E6', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', padding:0, marginBottom:16}}
                          >
                            View all details
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:4}}>
                              <path d="M6 12l4-4-4-4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => openDocumentModal('address')} 
                        style={{
                          width:'100%', 
                          padding:'12px 0', 
                          background: uploadedDocuments.address.status === 'verified' ? '#f5f8fc' : '#4776E6', 
                          color: uploadedDocuments.address.status === 'verified' ? '#4776E6' : '#fff', 
                          border: uploadedDocuments.address.status === 'verified' ? '1px solid #4776E6' : 'none', 
                          borderRadius:6, 
                          fontWeight:600, 
                          fontSize:15, 
                          cursor:'pointer'
                        }}
                      >
                        {uploadedDocuments.address.status === 'verified' ? 'Re-upload' : uploadedDocuments.address.status === 'pending' ? 'Replace Document' : 'Upload Document'}
                      </button>
                    </div>
                    
                    <div className="document-card" style={{background:'white', borderRadius:12, padding:24, border: uploadedDocuments.passport.status === 'pending' ? '2px solid #ffd700' : uploadedDocuments.passport.status === 'verified' ? '2px solid #b6e6c9' : '1px solid #eee'}}>
                      <div className="document-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div className="document-icon-title">
                          <div className="document-icon" style={{background:'#e6f9f1', width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <rect x="4" y="4" width="16" height="16" rx="2" stroke="#34d399" strokeWidth="2" />
                              <path d="M12 4v16M8 10h2M8 14h2M14 10h2M14 14h2" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h4 style={{margin:0, fontSize:18, fontWeight:600}}>Passport</h4>
                        </div>
                        <div className="document-status">
                          <span style={{background: uploadedDocuments.passport.status === 'verified' ? '#d4f5df' : uploadedDocuments.passport.status === 'pending' ? '#fff7e0' : '#eee', color: uploadedDocuments.passport.status === 'verified' ? '#218838' : uploadedDocuments.passport.status === 'pending' ? '#e6a700' : '#888', borderRadius:8, padding:'4px 12px', fontSize:13}}>
                            {uploadedDocuments.passport.status === 'verified' ? 'Verified' : uploadedDocuments.passport.status === 'pending' ? 'Pending' : 'Not Uploaded'}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{margin:'0 0 12px 0', color:'#666', fontSize:14}}>
                        International passport with photo and personal details
                      </p>
                      
                      {uploadedDocuments.passport.status !== 'not_uploaded' && (
                        <>
                          <div className="file-info" style={{display:'flex', alignItems:'center', marginBottom:12, background:'#f5f8fc', padding:'8px 12px', borderRadius:6}}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight:8, flexShrink:0}}>
                              <path d="M4 14h8a2 2 0 002-2V6L10 2H4a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 2v4h4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{fontSize:14, wordBreak:'break-all'}}>{uploadedDocuments.passport.fileName}</span>
                          </div>
                          <div className="document-info" style={{fontSize:14, color:'#666', marginBottom:12}}>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Passport No:</span> 
                              <span>{uploadedDocuments.passport.details?.number || 'Not provided'}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Name:</span> 
                              <span>{uploadedDocuments.passport.details?.name || 'Not provided'}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Nationality:</span> 
                              <span>{uploadedDocuments.passport.details?.nationality || 'Not provided'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => openDocumentDetails('passport')} 
                            style={{background:'transparent', border:'none', color:'#4776E6', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', padding:0, marginBottom:16}}
                          >
                            View all details
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:4}}>
                              <path d="M6 12l4-4-4-4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => openDocumentModal('passport')} 
                        style={{
                          width:'100%', 
                          padding:'12px 0', 
                          background: uploadedDocuments.passport.status === 'verified' ? '#f5f8fc' : '#4776E6', 
                          color: uploadedDocuments.passport.status === 'verified' ? '#4776E6' : '#fff', 
                          border: uploadedDocuments.passport.status === 'verified' ? '1px solid #4776E6' : 'none', 
                          borderRadius:6, 
                          fontWeight:600, 
                          fontSize:15, 
                          cursor:'pointer'
                        }}
                      >
                        {uploadedDocuments.passport.status === 'verified' ? 'Re-upload' : uploadedDocuments.passport.status === 'pending' ? 'Replace Document' : 'Upload Document'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="document-category">
                  <h4 className="category-title">Tax & Financial Documents</h4>
                  <div className="document-grid">
                    <div className="document-card" style={{background:'white', borderRadius:12, padding:24, border: uploadedDocuments.pan.status === 'pending' ? '2px solid #ffd700' : uploadedDocuments.pan.status === 'verified' ? '2px solid #b6e6c9' : '1px solid #eee'}}>
                      <div className="document-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div className="document-icon-title">
                          <div className="document-icon" style={{background:'#f0e6ff', width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke="#9061f9" strokeWidth="2" />
                              <path d="M12 9v6M9 12h6" stroke="#9061f9" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h4 style={{margin:0, fontSize:18, fontWeight:600}}>PAN Card</h4>
                        </div>
                        <div className="document-status">
                          <span style={{background: uploadedDocuments.pan.status === 'verified' ? '#d4f5df' : uploadedDocuments.pan.status === 'pending' ? '#fff7e0' : '#eee', color: uploadedDocuments.pan.status === 'verified' ? '#218838' : uploadedDocuments.pan.status === 'pending' ? '#e6a700' : '#888', borderRadius:8, padding:'4px 12px', fontSize:13}}>
                            {uploadedDocuments.pan.status === 'verified' ? 'Verified' : uploadedDocuments.pan.status === 'pending' ? 'Pending' : 'Not Uploaded'}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{margin:'0 0 12px 0', color:'#666', fontSize:14}}>
                        Permanent Account Number card for tax purposes
                      </p>
                      
                      {uploadedDocuments.pan.status !== 'not_uploaded' && (
                        <>
                          <div className="file-info" style={{display:'flex', alignItems:'center', marginBottom:12, background:'#f5f8fc', padding:'8px 12px', borderRadius:6}}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight:8, flexShrink:0}}>
                              <path d="M4 14h8a2 2 0 002-2V6L10 2H4a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 2v4h4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{fontSize:14, wordBreak:'break-all'}}>{uploadedDocuments.pan.fileName}</span>
                          </div>
                          <div className="document-info" style={{fontSize:14, color:'#666', marginBottom:12}}>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>PAN Number:</span> 
                              <span>{uploadedDocuments.pan.details?.number || 'Not provided'}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Name:</span> 
                              <span>{uploadedDocuments.pan.details?.name || 'Not provided'}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Uploaded:</span> 
                              <span>{uploadedDocuments.pan.uploadDate}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => openDocumentDetails('pan')} 
                            style={{background:'transparent', border:'none', color:'#4776E6', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', padding:0, marginBottom:16}}
                          >
                            View all details
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:4}}>
                              <path d="M6 12l4-4-4-4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => openDocumentModal('pan')} 
                        style={{
                          width:'100%', 
                          padding:'12px 0', 
                          background: uploadedDocuments.pan.status === 'verified' ? '#f5f8fc' : '#4776E6', 
                          color: uploadedDocuments.pan.status === 'verified' ? '#4776E6' : '#fff', 
                          border: uploadedDocuments.pan.status === 'verified' ? '1px solid #4776E6' : 'none', 
                          borderRadius:6, 
                          fontWeight:600, 
                          fontSize:15, 
                          cursor:'pointer'
                        }}
                      >
                        {uploadedDocuments.pan.status === 'verified' ? 'Re-upload' : uploadedDocuments.pan.status === 'pending' ? 'Replace Document' : 'Upload Document'}
                      </button>
                    </div>
                    
                    <div className="document-card" style={{background:'white', borderRadius:12, padding:24, border: uploadedDocuments.tax.status === 'pending' ? '2px solid #ffd700' : uploadedDocuments.tax.status === 'verified' ? '2px solid #b6e6c9' : '1px solid #eee'}}>
                      <div className="document-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div className="document-icon-title">
                          <div className="document-icon" style={{background:'#e6f6ef', width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#34a287" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#34a287" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <h4 style={{margin:0, fontSize:18, fontWeight:600}}>Tax Document</h4>
                        </div>
                        <div className="document-status">
                          <span style={{background: uploadedDocuments.tax.status === 'verified' ? '#d4f5df' : uploadedDocuments.tax.status === 'pending' ? '#fff7e0' : '#eee', color: uploadedDocuments.tax.status === 'verified' ? '#218838' : uploadedDocuments.tax.status === 'pending' ? '#e6a700' : '#888', borderRadius:8, padding:'4px 12px', fontSize:13}}>
                            {uploadedDocuments.tax.status === 'verified' ? 'Verified' : uploadedDocuments.tax.status === 'pending' ? 'Pending' : 'Not Uploaded'}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{margin:'0 0 12px 0', color:'#666', fontSize:14}}>
                        Income tax return or other tax-related document
                      </p>
                      
                      {uploadedDocuments.tax.status !== 'not_uploaded' && (
                        <>
                          <div className="file-info" style={{display:'flex', alignItems:'center', marginBottom:12, background:'#f5f8fc', padding:'8px 12px', borderRadius:6}}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight:8, flexShrink:0}}>
                              <path d="M4 14h8a2 2 0 002-2V6L10 2H4a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 2v4h4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{fontSize:14, wordBreak:'break-all'}}>{uploadedDocuments.tax.fileName}</span>
                          </div>
                          <div className="document-info" style={{fontSize:14, color:'#666', marginBottom:12}}>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Document Type:</span> 
                              <span>{uploadedDocuments.tax.docType}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Tax Year:</span> 
                              <span>{uploadedDocuments.tax.details?.taxYear || 'Not provided'}</span>
                            </div>
                            <div style={{display:'flex', marginBottom:4}}>
                              <span style={{fontWeight:600, width:120}}>Uploaded:</span> 
                              <span>{uploadedDocuments.tax.uploadDate}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => openDocumentDetails('tax')} 
                            style={{background:'transparent', border:'none', color:'#4776E6', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', padding:0, marginBottom:16}}
                          >
                            View all details
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:4}}>
                              <path d="M6 12l4-4-4-4" stroke="#4776E6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => openDocumentModal('tax')} 
                        style={{
                          width:'100%', 
                          padding:'12px 0', 
                          background: uploadedDocuments.tax.status === 'verified' ? '#f5f8fc' : '#4776E6', 
                          color: uploadedDocuments.tax.status === 'verified' ? '#4776E6' : '#fff', 
                          border: uploadedDocuments.tax.status === 'verified' ? '1px solid #4776E6' : 'none', 
                          borderRadius:6, 
                          fontWeight:600, 
                          fontSize:15, 
                          cursor:'pointer'
                        }}
                      >
                        {uploadedDocuments.tax.status === 'verified' ? 'Re-upload' : uploadedDocuments.tax.status === 'pending' ? 'Replace Document' : 'Upload Document'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'subscription':
        return (
          <div className="profile-tab-content">
            <h3>Subscription Plan</h3>
            <div className="subscription-plans">
              {subscriptionPlans.map(planObj => (
                <div key={planObj.id} className={`subscription-plan ${plan === planObj.name ? 'active' : ''}`} style={{border: plan === planObj.name ? '2px solid #2563eb' : '1px solid #eee', background: plan === planObj.name ? '#f4faff' : '#fff', borderRadius: 12, padding: 24, height: '100%'}}>
                  <div className="plan-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h4>{planObj.name}</h4>
                    <span className="plan-price" style={{fontWeight:700,fontSize:22}}>{planObj.price}</span>
                    {plan === planObj.name && <span style={{background:'#2563eb',color:'#fff',borderRadius:8,padding:'4px 12px',fontSize:13,marginLeft:8}}>Current Plan</span>}
                  </div>
                  <ul className="plan-features" style={{margin:'18px 0 24px 0',padding:0,listStyle:'none'}}>
                    {planObj.features.map((feature, index) => (
                      <li key={index} style={{color:'#666',marginBottom:8}}>{feature}</li>
                    ))}
                  </ul>
                  {plan !== planObj.name && (
                    <button onClick={()=>handlePlanChange(planObj.name)} style={{width:'100%',padding:'13px 0',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16,cursor:'pointer'}}>Upgrade</button>
                  )}
                  {plan === planObj.name && plan !== 'Free' && (
                    <button onClick={()=>handlePlanChange('Free')} style={{width:'100%',padding:'13px 0',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16,cursor:'pointer'}}>Cancel Subscription</button>
                  )}
                  {plan === planObj.name && plan === 'Pro' && (
                    <button onClick={()=>handlePlanChange('Free')} style={{width:'100%',padding:'13px 0',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16,cursor:'pointer',marginTop:8}}>Downgrade</button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="subscription-info">
              <h3>Subscription Details</h3>
              <div className="info-card">
                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Current Plan:</span>
                    <span className="info-value">Pro</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Next Billing Date:</span>
                    <span className="info-value">October 15, 2023</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Payment Method:</span>
                    <span className="info-value">Visa ending in 4242</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="usage-stats">
              <h3>Usage Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <h4>API Calls</h4>
                  </div>
                  <div className="stat-value">1,245 / 5,000</div>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: '25%' }}></div>
                  </div>
                  <div className="stat-footer">25% of monthly limit</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'ai':
        return (
          <div className="profile-tab-content">
            <h3>AI Model Customization</h3>
            <div className="ai-settings" style={{background:'#f8f9fa',borderRadius:12,padding:28,boxShadow:'0 2px 10px rgba(0,0,0,0.07)'}}>
              <div className="setting-group">
                <label style={{fontWeight:600}}>Risk Tolerance</label>
                <div className="slider-container" style={{marginTop:10}}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={aiSettingsDraft.riskTolerance}
                    onChange={handleRiskToleranceChange}
                    className="risk-slider"
                    style={{width:'100%'}}
                  />
                  <div className="slider-labels" style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:13}}>
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Aggressive</span>
                  </div>
                  <div className="slider-value" style={{textAlign:'center',fontWeight:700,fontSize:18,marginTop:6}}>{aiSettingsDraft.riskTolerance}%</div>
                </div>
              </div>
              <div className="setting-group">
                <label style={{fontWeight:600}}>Confidence Threshold</label>
                <div className="slider-container" style={{marginTop:10}}>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={aiSettingsDraft.confidenceThreshold}
                    onChange={handleConfidenceThresholdChange}
                    className="confidence-slider"
                    style={{width:'100%'}}
                  />
                  <div className="slider-labels" style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:13}}>
                    <span>More Signals</span>
                    <span>Balanced</span>
                    <span>High Confidence</span>
                  </div>
                  <div className="slider-value" style={{textAlign:'center',fontWeight:700,fontSize:18,marginTop:6}}>{aiSettingsDraft.confidenceThreshold}%</div>
                </div>
              </div>
              <div className="setting-group">
                <label style={{fontWeight:600}}>Preferred AI Strategy</label>
                <div className="strategy-selector" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))',gap:18,marginTop:12}}>
                  <div className={`strategy-option${aiSettingsDraft.preferredStrategy==='momentum'?' selected':''}`} onClick={()=>handlePreferredStrategyChange('momentum')} style={{cursor:'pointer',padding:18,borderRadius:8,border:aiSettingsDraft.preferredStrategy==='momentum'?'2px solid #2563eb':'2px solid #eee',background:aiSettingsDraft.preferredStrategy==='momentum'?'#eaf4fb':'#fff',transition:'all 0.2s'}}>
                    <div className="strategy-icon" style={{fontSize:22,color:'#2563eb',marginBottom:8}}><svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 19L19 3M3 3h16v16" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
                    <div className="strategy-name" style={{fontWeight:600}}>Momentum</div>
                    <div className="strategy-description" style={{fontSize:13,marginTop:4}}>Identifies stocks with strong price and volume trends</div>
                  </div>
                  <div className={`strategy-option${aiSettingsDraft.preferredStrategy==='swing'?' selected':''}`} onClick={()=>handlePreferredStrategyChange('swing')} style={{cursor:'pointer',padding:18,borderRadius:8,border:aiSettingsDraft.preferredStrategy==='swing'?'2px solid #2563eb':'2px solid #eee',background:aiSettingsDraft.preferredStrategy==='swing'?'#eaf4fb':'#fff',transition:'all 0.2s'}}>
                    <div className="strategy-icon" style={{fontSize:22,color:'#2563eb',marginBottom:8}}><svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 11h4l4-8 4 16h4" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" fill="none"/></svg></div>
                    <div className="strategy-name" style={{fontWeight:600}}>Swing</div>
                    <div className="strategy-description" style={{fontSize:13,marginTop:4}}>Captures gains in a stock within a short time frame</div>
                </div>
                  <div className={`strategy-option${aiSettingsDraft.preferredStrategy==='intraday'?' selected':''}`} onClick={()=>handlePreferredStrategyChange('intraday')} style={{cursor:'pointer',padding:18,borderRadius:8,border:aiSettingsDraft.preferredStrategy==='intraday'?'2px solid #2563eb':'2px solid #eee',background:aiSettingsDraft.preferredStrategy==='intraday'?'#eaf4fb':'#fff',transition:'all 0.2s'}}>
                    <div className="strategy-icon" style={{fontSize:22,color:'#2563eb',marginBottom:8}}><svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" stroke="#2563eb" strokeWidth="2.2" fill="none"/><path d="M11 6v5l4 2" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
                    <div className="strategy-name" style={{fontWeight:600}}>Intraday</div>
                    <div className="strategy-description" style={{fontSize:13,marginTop:4}}>Focuses on short-term trades within the same day</div>
              </div>
                  <div className={`strategy-option${aiSettingsDraft.preferredStrategy==='value'?' selected':''}`} onClick={()=>handlePreferredStrategyChange('value')} style={{cursor:'pointer',padding:18,borderRadius:8,border:aiSettingsDraft.preferredStrategy==='value'?'2px solid #2563eb':'2px solid #eee',background:aiSettingsDraft.preferredStrategy==='value'?'#eaf4fb':'#fff',transition:'all 0.2s'}}>
                    <div className="strategy-icon" style={{fontSize:22,color:'#2563eb',marginBottom:8}}><svg width="22" height="22" viewBox="0 0 22 22"><rect x="4" y="8" width="14" height="8" rx="3" stroke="#2563eb" strokeWidth="2.2" fill="none"/><path d="M7 12h8" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
                    <div className="strategy-name" style={{fontWeight:600}}>Value</div>
                    <div className="strategy-description" style={{fontSize:13,marginTop:4}}>Targets undervalued stocks for long-term growth</div>
                  </div>
                </div>
              </div>
              {aiSettingsError && <div style={{color:'#e74c3c',marginTop:14,fontWeight:500}}>{aiSettingsError}</div>}
              {aiSettingsSuccess && <div style={{color:'#218838',marginTop:14,fontWeight:500}}>{aiSettingsSuccess}</div>}
              <div className="ai-settings-actions" style={{display:'flex',gap:14,marginTop:24}}>
                <button className="save-settings-btn" onClick={handleSaveAISettings} style={{padding:'13px 0',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16,flex:3,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {/* Save SVG */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="#fff" strokeWidth="2"/><path d="M7 10.5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  Save AI Settings
                </button>
                <button className="reset-settings-btn" onClick={handleResetAISettings} style={{padding:'13px 0',background:'#f1f1f1',color:'#2563eb',border:'none',borderRadius:6,fontWeight:600,fontSize:16,flex:2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {/* Reset SVG */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v2.5A4.5 4.5 0 1 1 5.5 10H3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/><path d="M3 7V3h4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'watchlist':
        return (
          <div className="profile-tab-content">
            <h3>Watchlist & Alerts Management</h3>
            <div className="watchlist-management">
              <div className="watchlist-header">
                <h4>Your Watchlist</h4>
                <button className="add-stock-btn" onClick={() => setShowAddStockModal(true)}>
                  {/* Inline plus SVG icon */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="#F2F2F2"/>
                    <path d="M16 10V22" stroke="#7B8A8B" stroke-width="3" stroke-linecap="round"/>
                    <path d="M10 16H22" stroke="#7B8A8B" stroke-width="3" stroke-linecap="round"/>
                  </svg>
                  Add Stock
                </button>
              </div>
              
              <table className="watchlist-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Alerts</th>
                    <th>AI Alerts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistItems.map(item => (
                    <tr key={item.symbol}>
                      <td className="symbol">{item.symbol}</td>
                      <td>{item.name}</td>
                      <td>
                        <span className="alert-count">{item.alerts.length}</span>
                      </td>
                      <td>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id={`ai-toggle-${item.symbol}`} 
                            checked={item.aiAlerts}
                          />
                          <label htmlFor={`ai-toggle-${item.symbol}`}></label>
                        </div>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => handleAlertsClick(item.symbol)}>
                          {/* Inline bell SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                            <path d="M256 512c35.3 0 64-28.7 64-64H192c0 35.3 28.7 64 64 64zm215.4-149.1c-20.9-21.1-55.5-52.6-55.5-154.9 0-77.7-54.5-139.1-127.9-155.2V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v20.8C150.6 68.9 96 130.3 96 208c0 102.3-34.6 133.8-55.5 154.9-6 6.1-8.5 14.3-6.8 22.4 1.7 8.1 7.6 14.6 15.7 16.7C62.3 404.6 109.6 416 256 416s193.7-11.4 206.6-14.1c8.1-2.1 14-8.6 15.7-16.7 1.7-8.1-0.8-16.3-6.9-22.3z"/>
                          </svg>
                          <span>Alerts</span>
                        </button>
                        <button className="action-btn remove" onClick={() => handleRemoveClick(item.symbol)}>
                          {/* Inline delete SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                            <path d="M432 32H320l-9.4-18.7A24 24 0 0 0 288 0H224a24 24 0 0 0-22.6 13.3L192 32H80a16 16 0 0 0 0 32h16v400a48 48 0 0 0 48 48h224a48 48 0 0 0 48-48V64h16a16 16 0 0 0 0-32zM96 464V64h320v400a16 16 0 0 1-16 16H112a16 16 0 0 1-16-16zm64-336a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16v16H160zm32 64a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v224a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16z"/>
                          </svg>
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="profile-tab-content">
            <h3>Security & Account Settings</h3>
            <div className="security-settings">
              <div className="security-section">
                <h4>Password</h4>
                <div className="security-info">
                  <div className="info-item">
                    <span className="label">Last changed:</span>
                    <span className="value">{securitySettings.password.lastChanged}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Strength:</span>
                    <span className="value strength">{securitySettings.password.strength}</span>
                  </div>
                </div>
                <button className="security-action-btn" onClick={()=>setShowPasswordModal(true)} style={{display:'flex',alignItems:'center',gap:10,padding:'14px 24px',background:'#3498db',color:'#fff',border:'none',borderRadius:8,fontWeight:500,fontSize:17,marginTop:18}}>
                  {/* Lock SVG */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><path d="M10 14V12a6 6 0 1 1 12 0v2" stroke="#7B8A8B" strokeWidth="2.2" strokeLinecap="round"/><rect x="8" y="14" width="16" height="10" rx="3" stroke="#7B8A8B" strokeWidth="2.2"/><circle cx="16" cy="19" r="1.5" fill="#7B8A8B"/></svg>
                  Change Password
                </button>
              </div>
              
              <div className="security-section">
                <h4>Two-Factor Authentication</h4>
                <div className="security-info">
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className="value status">
                      {twoFAStatus ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {twoFAStatus && (
                    <div className="info-item">
                      <span className="label">Type:</span>
                      <span className="value">{securitySettings.twoFactor.type}</span>
                    </div>
                  )}
                </div>
                <button className="security-action-btn" onClick={()=>setShow2FAModal(true)} style={{display:'flex',alignItems:'center',gap:10,padding:'14px 24px',background:'#3498db',color:'#fff',border:'none',borderRadius:8,fontWeight:500,fontSize:17,marginTop:18}}>
                  {/* Key SVG */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><circle cx="20" cy="12" r="5" stroke="#7B8A8B" strokeWidth="2.2"/><rect x="8" y="22" width="8" height="2.5" rx="1.25" fill="#7B8A8B"/><rect x="14" y="18" width="2" height="6.5" rx="1" fill="#7B8A8B"/></svg>
                  {twoFAStatus ? 'Manage 2FA' : 'Enable 2FA'}
                </button>
              </div>
              
              <div className="security-section danger-zone">
                <h4>Account Deletion</h4>
                <p className="warning-text">
                  <FaExclamationTriangle className="warning-icon" /> 
                  Deleting your account is permanent. All your data will be permanently removed.
                </p>
                <button className="security-action-btn danger" onClick={()=>setShowDeleteAccountModal(true)} style={{display:'flex',alignItems:'center',gap:10,padding:'14px 24px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,fontWeight:500,fontSize:17,marginTop:18}}>
                  {/* Trash SVG */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#f7d7d7"/><path d="M10 12h12M12 12v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V12M14 12V10a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2" stroke="#b03a2e" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'referral':
        return (
          <div className="profile-tab-content">
            <h3>Referral & Rewards</h3>
            <div className="referral-section">
              <div className="referral-card">
                <div className="referral-header">
                  <h4>Your Referral Link</h4>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span>{referralStats.code}</span>
                    <button onClick={handleCopy} style={{background:'#f2f2f2',border:'none',borderRadius:8,padding:8,cursor:'pointer',display:'flex',alignItems:'center'}} title="Copy Link">
                      {/* Copy SVG */}
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#e3eaf3"/><path d="M10 10a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8Z" stroke="#7B8A8B" strokeWidth="1.7"/><rect x="8" y="12" width="8" height="8" rx="2" fill="#b3c2cc"/></svg>
                    </button>
                    {copySuccess && <span style={{color:'#218838',fontWeight:500,marginLeft:8}}>{copySuccess}</span>}
                  </div>
                </div>
                <div className="referral-actions" style={{display:'flex',gap:16,margin:'18px 0'}}>
                  <button onClick={handleEmailShare} style={{background:'#f2f2f2',border:'none',borderRadius:8,padding:'18px 24px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',minWidth:140}}>
                    {/* Email SVG */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><path d="M8 12l8 6 8-6" stroke="#7B8A8B" strokeWidth="2"/><rect x="8" y="12" width="16" height="8" rx="2" stroke="#7B8A8B" strokeWidth="2"/></svg>
                    <span style={{marginTop:8,fontWeight:500}}>Share via Email</span>
                  </button>
                  <button onClick={()=>setShowShareModal(true)} style={{background:'#f2f2f2',border:'none',borderRadius:8,padding:'18px 24px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',minWidth:180}}>
                    {/* Share SVG */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><path d="M20 12l-8 4m0 0l8 4m-8-4h12" stroke="#7B8A8B" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span style={{marginTop:8,fontWeight:500}}>Share on Social Media</span>
                  </button>
                </div>
              </div>
              
              <div className="referral-stats-card">
                <h4>Your Referral Stats</h4>
                <div className="stats-container">
                  <div className="referral-stat">
                    <div className="stat-value">{referralStats.invites}</div>
                    <div className="stat-label">Friends Invited</div>
                  </div>
                  <div className="referral-stat">
                    <div className="stat-value">{referralStats.signups}</div>
                    <div className="stat-label">Successful Signups</div>
                  </div>
                  <div className="referral-stat">
                    <div className="stat-value">{referralStats.earnings}</div>
                    <div className="stat-label">Total Earnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'brokers':
        return (
          <div className="profile-tab-content">
            <h3>Connected Broker Accounts</h3>
            <div className="brokers-section">
              <div className="brokers-header">
                <p>Connect your brokerage accounts to enable automated trading and position tracking.</p>
                <button className="connect-new-btn" onClick={openBrokerModal}>
                  {/* Plus SVG */}
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#e3eaf3"/><path d="M14 8v12M8 14h12" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  Connect New Broker
                </button>
              </div>
              <div className="brokers-list">
                {brokers.map(broker => (
                  <div key={broker.id} className={`broker-card ${broker.status}`} style={{marginBottom:18,background:'#f8f9fa',borderRadius:10,padding:22,boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
                    <div className="broker-header" style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
                      {/* Custom SVG for each broker */}
                      {broker.name==='Zerodha' && <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><rect x="8" y="8" width="16" height="16" rx="4" fill="#008cff"/></svg>}
                      {broker.name==='Upstox' && <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><path d="M16 10v8m0 0l4-4m-4 4l-4-4" stroke="#4f8cff" strokeWidth="2.2" strokeLinecap="round"/></svg>}
                      {broker.name==='Fyers' && <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><path d="M10 22l6-12 6 12" stroke="#1e90ff" strokeWidth="2.2" strokeLinecap="round"/></svg>}
                      {!['Zerodha','Upstox','Fyers'].includes(broker.name) && <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#e3eaf3"/><circle cx="16" cy="16" r="8" fill="#2563eb"/></svg>}
                      <h4 style={{margin:0}}>{broker.name}</h4>
                      <span className={`broker-status ${broker.status}`} style={{marginLeft:10,fontWeight:600,fontSize:15}}>
                        {broker.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    {broker.status === 'connected' && (
                      <div className="broker-details" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div className="broker-info">
                          <div className="info-item"><span className="label">Last Sync:</span> <span className="value">{broker.lastSync}</span></div>
                          <div className="info-item"><span className="label">API Status:</span> <span className={`value ${broker.apiStatus.toLowerCase()}`}>{broker.apiStatus}</span></div>
                          </div>
                        <div className="broker-actions" style={{display:'flex',gap:10}}>
                          <button className="broker-action-btn sync" onClick={()=>handleSyncBroker(broker.id)} disabled={brokerModalProcessing} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,cursor:'pointer'}}>
                            {/* Sync SVG */}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2"/><path d="M10 5v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                            Sync Now
                          </button>
                          <button className="broker-action-btn disconnect" onClick={()=>handleDisconnectBroker(broker.id)} disabled={brokerModalProcessing} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,cursor:'pointer'}}>
                            {/* Disconnect SVG */}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="14" height="2" rx="1" fill="#fff"/></svg>
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                    {broker.status === 'disconnected' && (
                      <div className="broker-connect" style={{marginTop:10}}>
                        <p style={{marginBottom:10}}>Connect your {broker.name} account to enable trading and analysis.</p>
                        <button className="broker-action-btn connect" onClick={()=>handleConnectBroker(broker.id)} disabled={brokerModalProcessing} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:'#28a745',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,cursor:'pointer'}}>
                          {/* Connect SVG */}
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="9" y="3" width="2" height="14" rx="1" fill="#fff"/><rect x="3" y="9" width="14" height="2" rx="1" fill="#fff"/></svg>
                          Connect Account
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {brokerFeedback && <div style={{marginTop:18,color:'#2563eb',fontWeight:600,fontSize:16}}>{brokerFeedback}</div>}
            </div>
            {brokerModalOpen && (
              <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
                  <button onClick={()=>setBrokerModalOpen(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
                  <h3 style={{marginTop:0,marginBottom:18}}>Connect New Broker</h3>
                  <div style={{marginBottom:16}}>
                    <label style={{display:'block',marginBottom:6,fontWeight:500}}>Broker Name</label>
                    <input name="name" value={brokerForm.name} onChange={handleBrokerFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} placeholder="e.g. Zerodha" />
                    <label style={{display:'block',marginBottom:6,fontWeight:500}}>API Key</label>
                    <input name="apiKey" value={brokerForm.apiKey} onChange={handleBrokerFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} placeholder="Enter API Key" />
                    <label style={{display:'block',marginBottom:6,fontWeight:500}}>API Secret</label>
                    <input name="apiSecret" value={brokerForm.apiSecret} onChange={handleBrokerFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16}} placeholder="Enter API Secret" />
                  </div>
                  {brokerModalError && <div style={{color:'#e74c3c',marginBottom:12,fontWeight:500}}>{brokerModalError}</div>}
                  <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
                    <button onClick={()=>setBrokerModalOpen(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
                    <button onClick={handleAddBroker} style={{padding:'9px 20px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}} disabled={brokerModalProcessing}>{brokerModalProcessing ? 'Connecting...' : 'Connect'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <div className="profile-user-info">
          <div style={{display:'flex',gap:12,marginBottom:8}}>
            <button className="status-badge active" style={{background:'#d4f5df',color:'#218838',border:'none',borderRadius:18,padding:'7px 22px',fontWeight:500,fontSize:15,cursor:'pointer'}} onClick={()=>setShowAccountModal(true)}>
              {accountActive ? 'Active Account' : 'Inactive'}
            </button>
            <button className="status-badge subscription" style={{background:'#d4eaff',color:'#2563eb',border:'none',borderRadius:18,padding:'7px 22px',fontWeight:500,fontSize:15,cursor:'pointer'}} onClick={()=>setShowPlanModal(true)}>
              {plan} Plan
            </button>
          </div>
          <h2>{userData?.name || userData?.username}</h2>
          <p className="user-email">{userData?.email}</p>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} 
            onClick={() => handleTabChange('personal')}
          >
            <FaUser className="tab-icon" />
            <span className="tab-text">Personal Info</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`} 
            onClick={() => handleTabChange('subscription')}
          >
            <FaCreditCard className="tab-icon" />
            <span className="tab-text">Subscription</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} 
            onClick={() => handleTabChange('ai')}
          >
            <FaRobot className="tab-icon" />
            <span className="tab-text">AI Settings</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`} 
            onClick={() => handleTabChange('watchlist')}
          >
            <FaStar className="tab-icon" />
            <span className="tab-text">Watchlist</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} 
            onClick={() => handleTabChange('security')}
          >
            <FaShieldAlt className="tab-icon" />
            <span className="tab-text">Security</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'referral' ? 'active' : ''}`} 
            onClick={() => handleTabChange('referral')}
          >
            <FaUserFriends className="tab-icon" />
            <span className="tab-text">Referrals</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'brokers' ? 'active' : ''}`} 
            onClick={() => handleTabChange('brokers')}
          >
            <FaExchangeAlt className="tab-icon" />
            <span className="tab-text">Brokers</span>
          </button>
        </div>
        
        <div className="profile-tab-content-container">
          {renderTabContent()}
        </div>
      </div>
      {showAddStockModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative',animation:'fadeIn .2s'}}>
            <button onClick={()=>setShowAddStockModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Add Stock to Watchlist</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Symbol</label>
              <input value={newStockSymbol} onChange={e=>{setNewStockSymbol(e.target.value.toUpperCase());if(addStockError)setAddStockError("");}} placeholder="e.g. AAPL" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} maxLength={6} autoFocus />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Name</label>
              <input value={newStockName} onChange={e=>{setNewStockName(e.target.value);if(addStockError)setAddStockError("");}} placeholder="e.g. Apple Inc" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16}} />
            </div>
            {addStockError && <div style={{color:'#e74c3c',marginBottom:12,fontWeight:500}}>{addStockError}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShowAddStockModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={handleAddStock} style={{padding:'9px 20px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,boxShadow:'0 2px 8px rgba(52,152,219,0.08)'}} disabled={!newStockSymbol.trim()||!newStockName.trim()||!!addStockError}>Add</button>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.98);}to{opacity:1;transform:scale(1);}}`}</style>
        </div>
      )}
      {showRemoveModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <h3 style={{marginTop:0}}>Remove Stock</h3>
            <p>Are you sure you want to remove <b>{removeSymbol}</b> from your watchlist?</p>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:24}}>
              <button onClick={cancelRemove} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={confirmRemove} style={{padding:'9px 20px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Remove</button>
            </div>
          </div>
        </div>
      )}
      {showAlertsModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={cancelAlerts} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Add Alert for {alertsSymbol}</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Alert Type</label>
              <select value={alertType} onChange={e=>setAlertType(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}}>
                <option value="price">Price</option>
                <option value="volume">Volume</option>
              </select>
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Value</label>
              <input value={alertValue} onChange={e=>{setAlertValue(e.target.value);if(alertError)setAlertError("");}} placeholder="e.g. 150" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16}} />
            </div>
            {alertError && <div style={{color:'#e74c3c',marginBottom:12,fontWeight:500}}>{alertError}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={cancelAlerts} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={handleAddAlert} style={{padding:'9px 20px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,boxShadow:'0 2px 8px rgba(52,152,219,0.08)'}} disabled={!alertValue.trim()||!!alertError}>Add Alert</button>
            </div>
          </div>
        </div>
      )}
      {showPasswordModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowPasswordModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Change Password</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Old Password</label>
              <input type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>New Password</label>
              <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16}} />
            </div>
            {passwordError && <div style={{color:'#e74c3c',marginBottom:12,fontWeight:500}}>{passwordError}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShowPasswordModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={handleChangePassword} style={{padding:'9px 20px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,boxShadow:'0 2px 8px rgba(52,152,219,0.08)'}} disabled={!oldPassword||!newPassword||!confirmPassword}>Change</button>
            </div>
          </div>
        </div>
      )}
      {show2FAModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShow2FAModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Manage Two-Factor Authentication</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>2FA Status</label>
              <div style={{marginBottom:14}}>
                <span style={{fontWeight:500}}>{twoFAStatus ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShow2FAModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={handle2FAToggle} style={{padding:'9px 20px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,boxShadow:'0 2px 8px rgba(52,152,219,0.08)'}}>{twoFAStatus ? 'Disable 2FA' : 'Enable 2FA'}</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteAccountModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowDeleteAccountModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Delete Account</h3>
            <div style={{marginBottom:16}}>
              <p style={{color:'#e74c3c',fontWeight:500}}>This action is permanent. Type <b>DELETE</b> to confirm.</p>
              <input value={deleteConfirm} onChange={e=>{setDeleteConfirm(e.target.value);if(deleteError)setDeleteError("");}} placeholder="Type DELETE to confirm" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16}} />
            </div>
            {deleteError && <div style={{color:'#e74c3c',marginBottom:12,fontWeight:500}}>{deleteError}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShowDeleteAccountModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{padding:'9px 20px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,boxShadow:'0 2px 8px rgba(231,76,60,0.08)'}} disabled={deleteConfirm!=="DELETE"}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {showAccountModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowAccountModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Account Status</h3>
            <div style={{marginBottom:16}}>
              <p style={{fontWeight:500}}>Your account is currently <span style={{color:accountActive?'#218838':'#e74c3c'}}>{accountActive?'Active':'Inactive'}</span>.</p>
              {accountActive ? (
                <button onClick={()=>handleAccountAction('deactivate')} style={{padding:'9px 20px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,marginTop:10}}>Deactivate Account</button>
              ) : (
                <button onClick={()=>handleAccountAction('activate')} style={{padding:'9px 20px',background:'#218838',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,marginTop:10}}>Reactivate Account</button>
              )}
            </div>
            {accountAction && (
              <div style={{marginTop:18}}>
                <p style={{color:'#e74c3c',fontWeight:500}}>Are you sure you want to {accountAction} your account?</p>
                <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
                  <button onClick={()=>setAccountAction('')} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
                  <button onClick={confirmAccountAction} style={{padding:'9px 20px',background:accountAction==='deactivate'?'#e74c3c':'#218838',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>{accountAction==='deactivate'?'Deactivate':'Reactivate'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showPlanModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowPlanModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Subscription Plan</h3>
            <div style={{marginBottom:16}}>
              <p style={{fontWeight:500}}>Current Plan: <span style={{color:'#2563eb'}}>{plan}</span></p>
              {plan==='Pro' ? (
                <button onClick={()=>handlePlanAction('cancel')} style={{padding:'9px 20px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,marginTop:10}}>Cancel Subscription</button>
              ) : (
                <button onClick={()=>handlePlanAction('upgrade')} style={{padding:'9px 20px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15,marginTop:10}}>Upgrade to Pro</button>
              )}
            </div>
            {planAction && (
              <div style={{marginTop:18}}>
                <p style={{color:'#e74c3c',fontWeight:500}}>Are you sure you want to {planAction} your plan?</p>
                <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
                  <button onClick={()=>setPlanAction('')} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
                  <button onClick={confirmPlanAction} style={{padding:'9px 20px',background:planAction==='cancel'?'#e74c3c':'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>{planAction==='cancel'?'Cancel Subscription':'Upgrade'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showShareModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowShareModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Share on Social Media</h3>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <button onClick={()=>window.open(`https://twitter.com/intent/tweet?text=Join%20me%20on%20RenX!%20${encodeURIComponent(referralLink)}`,'_blank')} style={{background:'#eaf4fb',border:'none',borderRadius:8,padding:'12px 18px',fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                {/* Twitter SVG */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#1da1f2"/><path d="M16.5 8.1c-.3.1-.6.2-.9.2.3-.2.6-.5.7-.9-.3.2-.7.4-1 .5-.3-.3-.7-.5-1.1-.5-1 0-1.7.9-1.5 1.8-1.4-.1-2.7-.7-3.5-1.7-.2.3-.2.7-.1 1 .2.3.5.6.9.7-.3 0-.6-.1-.8-.2 0 .7.5 1.3 1.2 1.4-.2.1-.5.1-.7.1.2.6.8 1 1.5 1-.6.5-1.3.8-2.1.8H6c.8.5 1.7.8 2.7.8 3.2 0 5-2.7 5-5v-.2c.3-.2.6-.5.8-.8z" fill="#fff"/></svg>
                Twitter
              </button>
              <button onClick={()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,'_blank')} style={{background:'#eaf4fb',border:'none',borderRadius:8,padding:'12px 18px',fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                {/* Facebook SVG */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#1877f3"/><path d="M12.7 11.7h1.1l.2-1.3h-1.3v-.8c0-.4.1-.6.6-.6h.7V8.1c-.1 0-.5-.1-1-.1-1.1 0-1.6.6-1.6 1.6v.8H9.1v1.3h1.3v3.2h1.6v-3.2z" fill="#fff"/></svg>
                Facebook
              </button>
              <button onClick={()=>window.open(`https://wa.me/?text=Join%20me%20on%20RenX!%20${encodeURIComponent(referralLink)}`,'_blank')} style={{background:'#eaf4fb',border:'none',borderRadius:8,padding:'12px 18px',fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                {/* WhatsApp SVG */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#25d366"/><path d="M16.1 13.7c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.1-.5.7-.6.8-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-1-.5-.5-.9-1.1-1-1.3-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1.1-.2 0-.4-.1-.1-.5-1.2-.7-1.6-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.3 0-.5.2-.2.2-.7.7-.7 1.7 0 1 .7 2 1.6 2.7.8.6 1.5.8 2 .8.4 0 .7 0 1-.1.3-.1.7-.5.8-.9.1-.4.1-.7.1-.8 0-.1-.1-.1-.2-.2-.2-.2z" fill="#fff"/></svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
      {showPlanConfirmModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowPlanConfirmModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Confirm Plan Change</h3>
            <div style={{marginBottom:16}}>
              <p style={{fontWeight:500}}>Are you sure you want to change your plan to <span style={{color:'#2563eb'}}>{pendingPlan}</span>?</p>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShowPlanConfirmModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={confirmPlanChange} style={{padding:'9px 20px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}} disabled={planProcessing}>{planProcessing ? 'Processing...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
      {planMessage && <div style={{position:'fixed',top:30,right:30,background:'#2563eb',color:'#fff',padding:'14px 28px',borderRadius:8,fontWeight:600,boxShadow:'0 2px 12px rgba(37,99,235,0.12)',zIndex:2000}}>{planMessage}</div>}
      {showEditModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowEditModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Edit Personal Information</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Name</label>
              <input value={editInfo.name} onChange={e=>setEditInfo({...editInfo,name:e.target.value})} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Email</label>
              <input value={editInfo.email} onChange={e=>setEditInfo({...editInfo,email:e.target.value})} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Phone</label>
              <input value={editInfo.phone} onChange={e=>setEditInfo({...editInfo,phone:e.target.value})} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Location</label>
              <input value={editInfo.location} onChange={e=>setEditInfo({...editInfo,location:e.target.value})} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16,marginBottom:14}} />
              <label style={{display:'block',marginBottom:6,fontWeight:500}}>Bio</label>
              <textarea value={editInfo.bio} onChange={e=>setEditInfo({...editInfo,bio:e.target.value})} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd',fontSize:16}} rows={3} />
            </div>
            {editError && <div style={{color:'#e74c3c',marginBottom:12,fontWeight:500}}>{editError}</div>}
            {editSuccess && <div style={{color:'#218838',marginBottom:12,fontWeight:500}}>{editSuccess}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShowEditModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Cancel</button>
              <button onClick={handleEditInfo} style={{padding:'9px 20px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Save</button>
            </div>
          </div>
        </div>
      )}
      {showKYCModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:340,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative'}}>
            <button onClick={()=>setShowKYCModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>KYC Status: {kycLevel?.name}</h3>
            <div style={{marginBottom:16}}>
              <p>Status: <b>{kycLevel?.status.charAt(0).toUpperCase()+kycLevel?.status.slice(1)}</b></p>
              <p>{kycLevel?.description}</p>
              <p>{kycLevel?.limits}</p>
              {kycLevel?.status==='pending' && <p style={{color:'#e6a700',fontWeight:500}}>Your verification is under review. Please check back later.</p>}
              {kycLevel?.status!=='verified' && kycLevel?.status!=='pending' && <p style={{color:'#2563eb',fontWeight:500}}>Please upload your documents to verify this level.</p>}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setShowKYCModal(false)} style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Close</button>
              {kycLevel?.status!=='verified' && kycLevel?.status!=='pending' && <button style={{padding:'9px 20px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}>Upload Documents</button>}
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:420,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',position:'relative',animation:'fadeIn .2s'}}>
            <button onClick={()=>setShowDocumentModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}} title="Close">&times;</button>
            <h3 style={{marginTop:0,marginBottom:18}}>Upload {documentType === 'id' ? 'Government ID' : 'Proof of Residence'}</h3>
            
            <div style={{marginBottom:24}}>
              <p style={{fontSize:14, color:'#666', margin:'0 0 16px 0', lineHeight:1.5}}>
                {documentType === 'id' 
                  ? 'Please upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID card).' 
                  : 'Please upload a proof of residence document dated within the last 3 months (utility bill, bank statement, etc).'}
              </p>
              
              <div className="document-requirements" style={{background:'#f5f8fc', padding:16, borderRadius:8, marginBottom:24}}>
                <h4 style={{margin:'0 0 8px 0', fontSize:16}}>Requirements:</h4>
                <ul style={{margin:0, paddingLeft:18, fontSize:14, color:'#666'}}>
                  <li>File must be JPG, PNG, or PDF</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Document must be valid and not expired</li>
                  <li>All information must be clearly visible</li>
                  {documentType === 'address' && <li>Document must be dated within the last 3 months</li>}
                </ul>
              </div>
              
              <div className="file-upload-area" style={{
                border: '2px dashed #ccd7e6',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                cursor: 'pointer',
                background: documentPreview ? '#f5f8fc' : 'white',
                position: 'relative',
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => document.getElementById('document-file-input').click()}
              >
                {!documentPreview ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{marginBottom:12}}>
                      <rect width="48" height="48" rx="24" fill="#e3eaf3"/>
                      <path d="M24 16v16M24 16l-4 4M24 16l4 4" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M32 28v4a2 2 0 01-2 2H18a2 2 0 01-2-2v-4" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p style={{margin:0, fontWeight:500, marginBottom:4}}>Drag & drop file here or click to browse</p>
                    <p style={{margin:0, fontSize:13, color:'#666'}}>JPG, PNG or PDF (max 5MB)</p>
                  </>
                ) : documentPreview === "pdf" ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{marginBottom:12}}>
                      <rect width="48" height="48" rx="8" fill="#e3eaf3"/>
                      <path d="M12 8a2 2 0 012-2h14l8 8v26a2 2 0 01-2 2H14a2 2 0 01-2-2V8z" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M28 6v8h8M20 28h8M20 22h8M20 34h8" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p style={{margin:0, fontWeight:500}}>{documentFile?.name}</p>
                    <p style={{margin:'4px 0 0 0', fontSize:13, color:'#666'}}>{(documentFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      style={{position:'absolute', top:8, right:8, background:'#f8f9fa', border:'none', borderRadius:4, padding:'4px 8px', cursor:'pointer', fontSize:13}}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocumentFile(null);
                        setDocumentPreview(null);
                      }}
                    >
                      Change
                    </button>
                  </>
                ) : (
                  <div style={{position:'relative', width:'100%'}}>
                    <img 
                      src={documentPreview} 
                      alt="Document preview" 
                      style={{maxWidth:'100%', maxHeight:180, borderRadius:4}} 
                    />
                    <button 
                      style={{position:'absolute', top:8, right:8, background:'#f8f9fa', border:'none', borderRadius:4, padding:'4px 8px', cursor:'pointer', fontSize:13}}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocumentFile(null);
                        setDocumentPreview(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  id="document-file-input" 
                  style={{display:'none'}} 
                  accept=".jpg,.jpeg,.png,.pdf" 
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            {documentError && <div style={{color:'#e74c3c', marginBottom:12, fontWeight:500}}>{documentError}</div>}
            {documentSuccess && <div style={{color:'#218838', marginBottom:12, fontWeight:500}}>{documentSuccess}</div>}
            
            <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
              <button 
                onClick={()=>setShowDocumentModal(false)} 
                style={{padding:'9px 20px',background:'#eee',border:'none',borderRadius:6,fontWeight:500,fontSize:15}}
                disabled={documentUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDocumentUpload} 
                style={{
                  padding:'9px 20px',
                  background:'#4776E6',
                  color:'#fff',
                  border:'none',
                  borderRadius:6,
                  fontWeight:500,
                  fontSize:15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                disabled={!documentFile || documentUploading}
              >
                {documentUploading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{animation: 'spin 1s linear infinite'}}>
                      <circle cx="8" cy="8" r="7" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
                      <path d="M15 8c0-3.866-3.134-7-7-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload Document'}
              </button>
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        </div>
      )}
      
      {/* Document Details Modal */}
      {showDetailsModal && selectedDocument && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div className="modal-content" style={{backgroundColor:'white', borderRadius:8, width:'90%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', padding:0, boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
            <div className="modal-header" style={{padding:'20px 24px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, backgroundColor:'white', zIndex:1, borderTopLeftRadius:8, borderTopRightRadius:8}}>
              <h3 style={{margin:0, fontSize:20, fontWeight:600}}>{getDocumentTypeName(selectedDocument)} Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{background:'transparent', border:'none', cursor:'pointer', padding:5}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#666" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body" style={{padding:'24px 24px 10px 24px'}}>
              <div className="document-preview" style={{marginBottom:24, textAlign:'center'}}>
                <div style={{background:'#f5f8fc', borderRadius:8, padding:16, marginBottom:16, display:'flex', alignItems:'center'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight:12, flexShrink:0}}>
                    <path d="M4 22h16a2 2 0 002-2V8l-6-6H4a2 2 0 00-2 2v16a2 2 0 002 2z" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="#4776E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{textAlign:'left', overflow:'hidden'}}>
                    <div style={{fontWeight:600, marginBottom:2}}>{uploadedDocuments[selectedDocument].fileName}</div>
                    <div style={{fontSize:14, color:'#666'}}>Uploaded: {uploadedDocuments[selectedDocument].uploadDate}</div>
                  </div>
                </div>
                
                <div style={{background:'#f0f0f0', borderRadius:8, height:180, display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
                  <div style={{position:'absolute', top:8, right:8, background:'#fff', borderRadius:4, padding:'4px 8px', fontSize:12, fontWeight:600, boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                    Preview not available
                  </div>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M12 10V16M12 10L9 7M12 10l3-3M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="document-info-section">
                <h4 style={{marginTop:0, marginBottom:16, fontSize:18, fontWeight:600}}>Document Information</h4>
                
                <div className="details-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px 24px', marginBottom:24}}>
                  <div className="detail-item">
                    <div style={{fontSize:14, color:'#666', marginBottom:4}}>Document Type</div>
                    <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].docType || getDocumentTypeName(selectedDocument)}</div>
                  </div>
                  <div className="detail-item">
                    <div style={{fontSize:14, color:'#666', marginBottom:4}}>Status</div>
                    <div style={{fontWeight:500, display:'inline-flex', alignItems:'center'}}>
                      <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:uploadedDocuments[selectedDocument].status==='verified'?'#28a745':uploadedDocuments[selectedDocument].status==='pending'?'#ffc107':'#dc3545', marginRight:6}}></span>
                      {uploadedDocuments[selectedDocument].status.charAt(0).toUpperCase() + uploadedDocuments[selectedDocument].status.slice(1)}
                    </div>
                  </div>
                  
                  {selectedDocument === 'id' && (
                    <>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>ID Number</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.number || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Full Name</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.name || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Date of Birth</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.dateOfBirth || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Issue Date</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.issueDate || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Expiry Date</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.expiryDate || 'Not provided'}</div>
                      </div>
                    </>
                  )}
                  
                  {selectedDocument === 'passport' && (
                    <>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Passport Number</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.number || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Full Name</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.name || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Nationality</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.nationality || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Date of Birth</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.dateOfBirth || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Issue Date</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.issueDate || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Expiry Date</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.expiryDate || 'Not provided'}</div>
                      </div>
                    </>
                  )}
                  
                  {selectedDocument === 'address' && (
                    <>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Address Line 1</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.address1 || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Address Line 2</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.address2 || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>City</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.city || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>State/Province</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.state || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Postal/ZIP Code</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.postalCode || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Country</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.country || 'Not provided'}</div>
                      </div>
                    </>
                  )}
                  
                  {selectedDocument === 'pan' && (
                    <>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>PAN Number</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.number || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Full Name</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.name || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Date of Birth</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.dateOfBirth || 'Not provided'}</div>
                      </div>
                    </>
                  )}
                  
                  {selectedDocument === 'tax' && (
                    <>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Tax ID Number</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.number || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Full Name</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.name || 'Not provided'}</div>
                      </div>
                      <div className="detail-item">
                        <div style={{fontSize:14, color:'#666', marginBottom:4}}>Tax Year</div>
                        <div style={{fontWeight:500}}>{uploadedDocuments[selectedDocument].details?.taxYear || 'Not provided'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{padding:'16px 24px 24px', display:'flex', justifyContent:'flex-end', gap:12}}>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                style={{padding:'10px 16px', background:'#f5f5f5', border:'none', borderRadius:4, fontWeight:500, cursor:'pointer'}}
              >
                Close
              </button>
              <button 
                onClick={() => {setShowDetailsModal(false); openDocumentModal(selectedDocument);}} 
                style={{padding:'10px 16px', background:'#4776E6', color:'white', border:'none', borderRadius:4, fontWeight:500, cursor:'pointer'}}
              >
                Replace Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection; 