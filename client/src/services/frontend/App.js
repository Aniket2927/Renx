import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages and layouts
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Trades from './pages/Trades';
import Markets from './pages/Markets';
import Orderbook from './pages/Orderbook';
import Watchlist from './pages/Watchlist';
import NotFound from './pages/NotFound';
import Accounts from './pages/Accounts';

// Components
import Navbar from './components/layout/Navbar';
import HomeNavbar from './components/layout/HomeNavbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import FaviconManager from './components/layout/FaviconManager';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

import './styles/App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppContent = () => {
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768);
  const { isAuthenticated } = useAuth();
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  // Close sidebar on mobile when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={
          <>
            <HomeNavbar />
            <Home />
            <Footer />
          </>
        } />
        
        <Route path="/login" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              <main className="content">
                <Login />
              </main>
            </div>
            <Footer />
          </>
        } />
        
        <Route path="/register" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              <main className="content">
                <Register />
              </main>
            </div>
            <Footer />
          </>
        } />
        
        <Route path="/dashboard" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="/profile" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="/trades" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Trades />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="/markets" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Markets />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="/markets/:symbol" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Markets />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="/watchlist" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="/orderbook" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Orderbook />
                </ProtectedRoute>
              </main>
            </div>
            <Footer />
          </>
        } />
        
        <Route path="/accounts" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              {isAuthenticated && <Sidebar visible={sidebarVisible} />}
              <main className={`content ${isAuthenticated && sidebarVisible ? 'with-sidebar' : ''}`}>
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              </main>
            </div>
          </>
        } />
        
        <Route path="*" element={
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="app-container">
              <main className="content">
                <NotFound />
              </main>
            </div>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <FaviconManager />
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App; 