require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool(); // This will use the .env values

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('Loading environment variables from:', path.join(__dirname, '.env'));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Import database
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const tradesRoutes = require('./routes/trades.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const orderbookRoutes = require('./routes/orderbook.routes');
const stockRoutes = require('./routes/stock.routes');

// Use stock routes (these work without database)
app.use('/api/stock', stockRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('RenX API is running with PostgreSQL');
});

// Database connection and sync
async function initializeDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    await db.sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    // Sync database (create tables if they don't exist)
    console.log('Syncing database tables...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');
    
    // Add database-dependent routes
    app.use('/api/auth', authRoutes);
    app.use('/api/trades', tradesRoutes);
    app.use('/api/watchlist', watchlistRoutes);
    app.use('/api/orderbook', orderbookRoutes);
    
    console.log('✅ All routes initialized');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    console.log('⚠️  Running with limited functionality - only stock API available');
    return false;
  }
}

// Initialize database and start server
async function startServer() {
  const dbInitialized = await initializeDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💾 Database status: ${dbInitialized ? 'Connected' : 'Not connected'}`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await db.sequelize.close();
    server.close();
  });
  
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await db.sequelize.close();
    server.close();
  });
}

startServer();

module.exports = app; 