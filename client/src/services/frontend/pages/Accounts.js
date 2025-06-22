import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserCircle, FaSpinner, FaCheck, FaTimes, FaCommentDots, 
         FaFileExport, FaSyncAlt, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('history'); // Set default to 'history'
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [formData, setFormData] = useState({
    accountName: '',
    leverage: '100',
    initialBalance: '10000',
    currency: 'USD'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  
  // Transaction History Filters
  const [dateFilter, setDateFilter] = useState('two-weeks');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // Available filters
  const dateFilterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This Week' },
    { value: 'two-weeks', label: 'Two Weeks' },
    { value: 'this-month', label: 'This Month' },
    { value: 'three-months', label: 'Three Months' },
    { value: 'six-months', label: 'Six Months' },
    { value: 'year', label: 'Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const typeFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'fee', label: 'Fee' },
    { value: 'interest', label: 'Interest' }
  ];

  const accountFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'demo-1', label: 'Demo Account 1' },
    { value: 'demo-2', label: 'Demo Account 2' },
    { value: 'wallet-1', label: 'Wallet 1' }
  ];

  // Platform options
  const platforms = [
    { id: 'mt5', name: 'MT5', color: '#4285F4', icon: '📊' },
    { id: 'ctrader', name: 'cTrader', color: '#EA4335', icon: '📈' },
    { id: 'mt4', name: 'MT4', color: '#34A853', icon: '📉' }
  ];

  // Example mock data for transactions (empty for now)
  useEffect(() => {
    // This would typically be an API call
    setTransactions([]);
  }, []);

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setShowPlatformModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle filter changes
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
  };

  const handleAccountFilterChange = (value) => {
    setAccountFilter(value);
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
  };

  // Apply filters
  const handleApplyFilters = () => {
    console.log('Applying filters:', { dateFilter, accountFilter, typeFilter });
    // This would typically trigger an API call with the filters
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Reset filters
  const handleResetFilters = () => {
    setDateFilter('two-weeks');
    setAccountFilter('all');
    setTypeFilter('all');
    // This would typically trigger an API call with reset filters
  };

  // Export transactions
  const handleExportTransactions = () => {
    console.log('Exporting transactions');
    // This would typically generate a CSV/PDF file for download
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon for column
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FaSort color="#ccc" />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.accountName.trim()) {
      errors.accountName = 'Account name is required';
    }
    
    if (parseInt(formData.leverage) < 1 || parseInt(formData.leverage) > 500) {
      errors.leverage = 'Leverage must be between 1 and 500';
    }
    
    if (parseInt(formData.initialBalance) < 1000 || parseInt(formData.initialBalance) > 100000) {
      errors.initialBalance = 'Initial balance must be between 1,000 and 100,000';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newAccount = {
        id: Date.now().toString(),
        platform: selectedPlatform.id,
        platformName: selectedPlatform.name,
        platformColor: selectedPlatform.color,
        accountName: formData.accountName,
        accountId: `DEMO${Math.floor(1000000 + Math.random() * 9000000)}`,
        leverage: formData.leverage,
        balance: formData.initialBalance,
        currency: formData.currency,
        equity: formData.initialBalance,
        margin: '0',
        freeMargin: formData.initialBalance,
        marginLevel: '0%',
        created: new Date().toISOString()
      };
      
      setAccounts(prev => [...prev, newAccount]);
      setIsLoading(false);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowPlatformModal(false);
        setSubmitSuccess(false);
        setFormData({
          accountName: '',
          leverage: '100',
          initialBalance: '10000',
          currency: 'USD'
        });
      }, 1500);
    }, 1500);
  };

  // Handle creating a new demo account
  const handleCreateDemoAccount = () => {
    setShowPlatformModal(false);
    setSelectedPlatform(null);
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Accounts</h2>
      
      {/* Tabs Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e0e0e0', 
        marginBottom: '30px', 
        marginTop: '20px' 
      }}>
        <button 
          style={{ 
            padding: '15px 20px', 
            fontSize: '16px', 
            fontWeight: activeTab === 'demo' ? '600' : '500', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: activeTab === 'demo' ? '#333' : '#777',
            position: 'relative',
            borderBottom: activeTab === 'demo' ? '3px solid #4caf50' : 'none'
          }} 
          onClick={() => handleTabChange('demo')}
        >
          Demo Accounts
        </button>
        <button 
          style={{ 
            padding: '15px 20px', 
            fontSize: '16px', 
            fontWeight: activeTab === 'wallet' ? '600' : '500', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: activeTab === 'wallet' ? '#333' : '#777',
            position: 'relative',
            borderBottom: activeTab === 'wallet' ? '3px solid #4caf50' : 'none'
          }} 
          onClick={() => handleTabChange('wallet')}
        >
          Wallet Accounts
        </button>
        <button 
          style={{ 
            padding: '15px 20px', 
            fontSize: '16px', 
            fontWeight: activeTab === 'history' ? '600' : '500', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: activeTab === 'history' ? '#333' : '#777',
            position: 'relative',
            borderBottom: activeTab === 'history' ? '3px solid #4caf50' : 'none'
          }} 
          onClick={() => handleTabChange('history')}
        >
          Transaction History
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'demo' && (
          <div>
            {/* Platform Selection Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '50px' 
            }}>
              {platforms.map(platform => (
                <div 
                  key={platform.id}
                  style={{ 
                    flex: 1, 
                    margin: '0 15px', 
                    padding: '20px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => handlePlatformSelect(platform)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e8e8e8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: platform.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '10px',
                      color: '#fff'
                    }}>
                      {platform.name === 'cTrader' ? 'c' : <FaUserCircle size={18} />}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>{platform.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {accounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '15px' }}>
                  No Accounts Created Yet!
                </h2>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#777', 
                  maxWidth: '500px', 
                  margin: '0 auto 30px', 
                  lineHeight: '1.5' 
                }}>
                  Get started by creating a new demo account. Created accounts will be displayed on this page.
                </p>
                <DemoAccountButton />
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Your Demo Accounts</h3>
                  <button 
                    style={{ 
                      backgroundColor: '#f5f5f5', 
                      color: '#333', 
                      border: 'none', 
                      padding: '8px 16px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}
                    onClick={handleCreateDemoAccount}
                  >
                    <FaPlus style={{ marginRight: '6px' }} /> New Account
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {accounts.map(account => (
                    <div key={account.id} style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: account.platformColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          color: '#fff',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}>
                          {account.platformName === 'cTrader' ? 'c' : account.platformName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '16px' }}>{account.accountName}</div>
                          <div style={{ color: '#777', fontSize: '14px' }}>{account.accountId}</div>
                        </div>
                      </div>
                      
                      <div style={{
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '15px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ color: '#777', fontSize: '14px' }}>Balance</span>
                          <span style={{ fontWeight: '600' }}>${Number(account.balance).toLocaleString()} {account.currency}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ color: '#777', fontSize: '14px' }}>Leverage</span>
                          <span>1:{account.leverage}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}>
                          <span style={{ color: '#777', fontSize: '14px' }}>Created</span>
                          <span style={{ fontSize: '14px' }}>{new Date(account.created).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginTop: '15px'
                      }}>
                        <button style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '8px 0',
                          borderRadius: '4px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          Open Terminal
                        </button>
                        <button style={{
                          backgroundColor: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          padding: '8px 0',
                          borderRadius: '4px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '15px' }}>
              No Wallet Accounts
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: '#777', 
              maxWidth: '500px', 
              margin: '0 auto 30px', 
              lineHeight: '1.5' 
            }}>
              Connect your wallet or create a new one to manage your funds.
            </p>
            <button 
              style={{ 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                border: 'none', 
                padding: '12px 24px', 
                fontSize: '16px', 
                fontWeight: '500', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                display: 'inline-block',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e8e8e8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            >
              Connect Wallet
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {/* Transaction History Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <FaFilter style={{ color: '#4caf50', marginRight: '10px', fontSize: '20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', textTransform: 'uppercase', color: '#444' }}>
                  Transaction History
                </h3>
              </div>
              <button 
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={handleExportTransactions}
              >
                <FaFileExport style={{ marginRight: '8px' }} />
                EXPORT
              </button>
            </div>

            {/* Transaction Count */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#555' }}>
                Total Count: {transactions.length}
              </p>
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              marginBottom: '30px',
              alignItems: 'flex-end'
            }}>
              {/* Date Filter */}
              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Transaction Date
                </label>
                <div style={{
                  position: 'relative',
                  width: '100%'
                }}>
                  <select
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      appearance: 'none',
                      backgroundColor: 'white',
                      fontSize: '14px'
                    }}
                  >
                    {dateFilterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <FaSort color="#666" />
                  </div>
                </div>
              </div>

              {/* Account Filter */}
              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Search by account
                </label>
                <div style={{
                  position: 'relative',
                  width: '100%'
                }}>
                  <select
                    value={accountFilter}
                    onChange={(e) => handleAccountFilterChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      appearance: 'none',
                      backgroundColor: 'white',
                      fontSize: '14px'
                    }}
                  >
                    {accountFilterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <FaSort color="#666" />
                  </div>
                </div>
              </div>

              {/* Type Filter */}
              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Search by type
                </label>
                <div style={{
                  position: 'relative',
                  width: '100%'
                }}>
                  <select
                    value={typeFilter}
                    onChange={(e) => handleTypeFilterChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      appearance: 'none',
                      backgroundColor: 'white',
                      fontSize: '14px'
                    }}
                  >
                    {typeFilterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <FaSort color="#666" />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyFilters}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px'
                }}
              >
                {isLoading ? (
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  'Apply'
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                style={{
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: 'none',
                  padding: '10px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px'
                }}
              >
                <FaSyncAlt style={{ marginRight: '6px' }} />
                Reset
              </button>
            </div>

            {/* Transactions Table */}
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f9f9f9',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <th 
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#555',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => requestSort('date')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>TRANSACTION DATE</span>
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th 
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#555',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => requestSort('type')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>TRANSACTION TYPE</span>
                        {getSortIcon('type')}
                      </div>
                    </th>
                    <th 
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#555',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => requestSort('payment')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>PAYMENT</span>
                        {getSortIcon('payment')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.date}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.payment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Platform Selection Modal */}
      {showPlatformModal && selectedPlatform && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: selectedPlatform.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {selectedPlatform.name === 'cTrader' ? 'c' : <FaUserCircle size={20} />}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Create {selectedPlatform.name} Demo Account
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Account Name*
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: formErrors.accountName ? '1px solid #e53935' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter account name"
                />
                {formErrors.accountName && (
                  <p style={{ color: '#e53935', margin: '4px 0 0', fontSize: '14px' }}>
                    {formErrors.accountName}
                  </p>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Leverage
                </label>
                <select
                  name="leverage"
                  value={formData.leverage}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: formErrors.leverage ? '1px solid #e53935' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="50">1:50</option>
                  <option value="100">1:100</option>
                  <option value="200">1:200</option>
                  <option value="500">1:500</option>
                </select>
                {formErrors.leverage && (
                  <p style={{ color: '#e53935', margin: '4px 0 0', fontSize: '14px' }}>
                    {formErrors.leverage}
                  </p>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Initial Balance
                </label>
                <select
                  name="initialBalance"
                  value={formData.initialBalance}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: formErrors.initialBalance ? '1px solid #e53935' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="10000">$10,000</option>
                  <option value="25000">$25,000</option>
                  <option value="50000">$50,000</option>
                  <option value="100000">$100,000</option>
                </select>
                {formErrors.initialBalance && (
                  <p style={{ color: '#e53935', margin: '4px 0 0', fontSize: '14px' }}>
                    {formErrors.initialBalance}
                  </p>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '24px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowPlatformModal(false)}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || submitSuccess}
                  style={{
                    backgroundColor: submitSuccess ? '#4caf50' : isLoading ? '#9e9e9e' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '150px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner style={{ 
                        marginRight: '8px',
                        animation: 'spin 1s linear infinite'
                      }} /> 
                      Creating...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <FaCheck style={{ marginRight: '8px' }} /> 
                      Created!
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Support Widget */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 900 }}>
        {showChatBubble && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            padding: '15px', 
            marginBottom: '10px', 
            maxWidth: '250px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <p style={{ fontWeight: '600', margin: 0 }}>Hi!</p>
              <button 
                onClick={() => setShowChatBubble(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#777',
                  fontSize: '16px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ margin: 0, color: '#666' }}>How can I help you?</p>
          </div>
        )}
        <button 
          onClick={() => setShowChatBubble(true)}
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#4caf50', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)', 
            fontSize: '24px' 
          }}
        >
          <FaCommentDots size={24} />
        </button>
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

const DemoAccountButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    leverage: '100',
    initialBalance: '10000',
    currency: 'USD'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Platform options
  const platforms = [
    { id: 'mt5', name: 'MT5', color: '#4285F4', icon: '📊' },
    { id: 'ctrader', name: 'cTrader', color: '#EA4335', icon: '📈' },
    { id: 'mt4', name: 'MT4', color: '#34A853', icon: '📉' }
  ];

  // Open modal with platform selection first
  const handleOpenModal = () => {
    setShowModal(true);
    setSelectedPlatform(null);
    setFormErrors({});
  };

  // Handle platform selection
  const handleSelectPlatform = (platform) => {
    setSelectedPlatform(platform);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.accountName.trim()) {
      errors.accountName = 'Account name is required';
    } else if (formData.accountName.length < 3) {
      errors.accountName = 'Account name must be at least 3 characters';
    }
    
    if (parseInt(formData.leverage) < 1 || parseInt(formData.leverage) > 500) {
      errors.leverage = 'Leverage must be between 1 and 500';
    }
    
    if (parseInt(formData.initialBalance) < 1000 || parseInt(formData.initialBalance) > 100000) {
      errors.initialBalance = 'Initial balance must be between 1,000 and 100,000';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create account logic would go here
      setIsLoading(false);
      setSubmitSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setFormData({
          accountName: '',
          leverage: '100',
          initialBalance: '10000',
          currency: 'USD'
        });
      }, 1500);
    }, 1500);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlatform(null);
    setFormErrors({});
  };

  return (
    <>
      <button 
        onClick={handleOpenModal}
        style={{ 
          backgroundColor: '#fff',
          color: '#333',
          border: '1px solid #ddd',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '500',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f8f8';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }}
      >
        <span style={{ marginRight: '8px', fontSize: '18px' }}>+</span> Open New Demo Account
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Modal Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#777'
                }}
              >
                ×
              </button>
            </div>

            {!selectedPlatform ? (
              // Platform Selection
              <>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#333',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  Select Trading Platform
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {platforms.map(platform => (
                    <div 
                      key={platform.id}
                      onClick={() => handleSelectPlatform(platform)}
                      style={{
                        padding: '20px 16px',
                        borderRadius: '8px',
                        border: '2px solid #f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = platform.color;
                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#f0f0f0';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: platform.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        fontSize: '24px',
                        color: 'white'
                      }}>
                        {platform.icon}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '16px' }}>{platform.name}</span>
                    </div>
                  ))}
                </div>
                
                <p style={{ 
                  textAlign: 'center', 
                  color: '#777',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  Choose your preferred trading platform to continue
                </p>
              </>
            ) : (
              // Account Creation Form
              <>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#333',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: selectedPlatform.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '18px',
                    color: 'white'
                  }}>
                    {selectedPlatform.icon}
                  </div>
                  Create {selectedPlatform.name} Demo Account
                </h3>
                
                <form onSubmit={handleSubmit}>
                  {/* Account Name */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      Account Name *
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="Enter account name"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: formErrors.accountName ? '1px solid #e53935' : '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px',
                        transition: 'border 0.2s ease',
                        backgroundColor: '#f9f9f9'
                      }}
                      onFocus={(e) => e.target.style.backgroundColor = '#fff'}
                      onBlur={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                    />
                    {formErrors.accountName && (
                      <p style={{ 
                        color: '#e53935', 
                        margin: '6px 0 0', 
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ marginRight: '4px' }}>⚠️</span>
                        {formErrors.accountName}
                      </p>
                    )}
                  </div>
                  
                  {/* Two-column layout for leverage and balance */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    {/* Leverage */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        fontSize: '14px',
                        color: '#555'
                      }}>
                        Leverage
                      </label>
                      <select
                        name="leverage"
                        value={formData.leverage}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: formErrors.leverage ? '1px solid #e53935' : '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: '#f9f9f9',
                          appearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20fill%3D%22%23444%22%20d%3D%22M7%209L2%204h10L7%209z%22%2F%3E%3C%2Fsvg%3E")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '10px'
                        }}
                      >
                        <option value="50">1:50</option>
                        <option value="100">1:100</option>
                        <option value="200">1:200</option>
                        <option value="300">1:300</option>
                        <option value="500">1:500</option>
                      </select>
                      {formErrors.leverage && (
                        <p style={{ 
                          color: '#e53935', 
                          margin: '6px 0 0', 
                          fontSize: '13px' 
                        }}>
                          <span style={{ marginRight: '4px' }}>⚠️</span>
                          {formErrors.leverage}
                        </p>
                      )}
                    </div>
                    
                    {/* Initial Balance */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        fontSize: '14px',
                        color: '#555'
                      }}>
                        Initial Balance
                      </label>
                      <select
                        name="initialBalance"
                        value={formData.initialBalance}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: formErrors.initialBalance ? '1px solid #e53935' : '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: '#f9f9f9',
                          appearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20fill%3D%22%23444%22%20d%3D%22M7%209L2%204h10L7%209z%22%2F%3E%3C%2Fsvg%3E")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '10px'
                        }}
                      >
                        <option value="10000">$10,000</option>
                        <option value="25000">$25,000</option>
                        <option value="50000">$50,000</option>
                        <option value="100000">$100,000</option>
                      </select>
                      {formErrors.initialBalance && (
                        <p style={{ 
                          color: '#e53935', 
                          margin: '6px 0 0', 
                          fontSize: '13px' 
                        }}>
                          <span style={{ marginRight: '4px' }}>⚠️</span>
                          {formErrors.initialBalance}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Currency */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: '#f9f9f9',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20fill%3D%22%23444%22%20d%3D%22M7%209L2%204h10L7%209z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '10px'
                      }}
                    >
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="JPY">Japanese Yen (JPY)</option>
                    </select>
                  </div>
                  
                  {/* Terms & Conditions */}
                  <div style={{ 
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#666',
                    border: '1px solid #eee'
                  }}>
                    <p style={{ margin: '0 0 12px' }}>
                      By creating an account, you agree to our:
                    </p>
                    <ul style={{ 
                      margin: 0,
                      paddingLeft: '20px',
                      listStyleType: 'disc'
                    }}>
                      <li style={{ marginBottom: '6px' }}>
                        <a href="#" style={{ color: '#4285F4', textDecoration: 'none' }}>
                          Terms of Service
                        </a>
                      </li>
                      <li>
                        <a href="#" style={{ color: '#4285F4', textDecoration: 'none' }}>
                          Privacy Policy
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform(null)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#555',
                        border: 'none',
                        padding: '12px 16px',
                        fontSize: '15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ← Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading || submitSuccess}
                      style={{
                        backgroundColor: submitSuccess ? '#4caf50' : isLoading ? '#e0e0e0' : selectedPlatform.color,
                        color: 'white',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: isLoading || submitSuccess ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '160px',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div style={{ 
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#fff',
                            animation: 'spin 1s linear infinite',
                            marginRight: '10px'
                          }}></div>
                          Processing...
                        </>
                      ) : submitSuccess ? (
                        <>
                          <span style={{ marginRight: '8px' }}>✓</span>
                          Account Created!
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Accounts; 