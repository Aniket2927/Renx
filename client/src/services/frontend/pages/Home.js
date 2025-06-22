import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaShieldAlt, FaMobileAlt, FaGlobe, FaRocket } from 'react-icons/fa';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Advanced Trading Platform for Modern Traders</h1>
          <p>Experience seamless trading with real-time data, advanced charts, and secure transactions</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/assets/trading-dashboard.png" alt="RenX Trading Dashboard" />
        </div>
      </section>

      <section className="features-section" id="features">
        <h2>Features That Set Us Apart</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Advanced Charting</h3>
            <p>Real-time market data with customizable charts for better analysis and informed decisions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Secure Transactions</h3>
            <p>Bank-grade security measures to ensure your assets and personal information are protected.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaMobileAlt />
            </div>
            <h3>Mobile Trading</h3>
            <p>Trade on the go with our responsive platform optimized for all devices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaGlobe />
            </div>
            <h3>Global Markets</h3>
            <p>Access multiple markets and assets from around the world in one platform.</p>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Basic</h3>
              <div className="price">$0<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>Real-time market data</li>
              <li>Basic charting tools</li>
              <li>5 trades per day</li>
              <li>Email support</li>
            </ul>
            <Link to="/register" className="btn btn-outline">Get Started</Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-header">
              <h3>Pro</h3>
              <div className="price">$29<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>Everything in Basic</li>
              <li>Advanced charting tools</li>
              <li>Unlimited trades</li>
              <li>Priority support</li>
              <li>Portfolio analysis</li>
            </ul>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Enterprise</h3>
              <div className="price">$99<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>Everything in Pro</li>
              <li>API access</li>
              <li>Dedicated account manager</li>
              <li>Custom integrations</li>
              <li>Advanced reporting</li>
            </ul>
            <Link to="/register" className="btn btn-outline">Contact Sales</Link>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <h2>About RenX Trading</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              RenX Trading was founded in 2023 with a mission to make trading accessible, 
              efficient, and secure for everyone. Our team of financial experts and 
              technology innovators work together to deliver a cutting-edge trading 
              experience.
            </p>
            <p>
              We believe that technology should empower traders, not complicate their 
              lives. That's why we've built a platform that combines powerful features 
              with an intuitive interface.
            </p>
            <div className="about-stats">
              <div className="stat">
                <div className="stat-number">100K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat">
                <div className="stat-number">$1B+</div>
                <div className="stat-label">Trade Volume</div>
              </div>
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img src="/assets/about-team.jpg" alt="RenX Team" />
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Trading?</h2>
          <p>Join thousands of traders who have already discovered the RenX advantage.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Create Account</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 