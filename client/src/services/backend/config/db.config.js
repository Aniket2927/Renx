// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/../.env' });

// Log environment variables for debugging
console.log('Loading environment variables from:', __dirname + '/../.env');
console.log('Loaded DB config:', {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  db: process.env.DB_NAME
});

module.exports = {
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'renx_admin',
  PASSWORD: process.env.DB_PASSWORD || 'renx_password',
  DB: process.env.DB_NAME || 'renx_db',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}; 