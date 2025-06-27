import { Pool } from 'pg';

// Database configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

// Standardized environment variable handling
const getEnvVar = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value) {
    console.warn(`⚠️  Environment variable ${key} not set, using fallback: ${fallback}`);
    return fallback;
  }
  return value;
};

// Parse database URL or construct from individual components
const getDatabaseConfig = (): DatabaseConfig => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        username: url.username,
        password: url.password,
        ssl: url.searchParams.get('ssl') === 'true' || url.searchParams.get('sslmode') === 'require',
        maxConnections: parseInt(getEnvVar('DB_MAX_CONNECTIONS', '20'))
      };
    } catch (error) {
      console.error('❌ Invalid DATABASE_URL format:', error);
      console.log('🔄 Falling back to individual environment variables...');
    }
  }
  
  // Fallback to individual environment variables
  return {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: parseInt(getEnvVar('DB_PORT', '5432')),
    database: getEnvVar('DB_NAME', 'renx_db'),
    username: getEnvVar('DB_USER', 'renx_admin'),
    password: getEnvVar('DB_PASSWORD', 'renx_password'),
    ssl: getEnvVar('DB_SSL', 'false').toLowerCase() === 'true',
    maxConnections: parseInt(getEnvVar('DB_MAX_CONNECTIONS', '20'))
  };
};

// Get database configuration
const config = getDatabaseConfig();

// Create and export the connection pool
export const pool = new Pool({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
  ssl: config.ssl ? { rejectUnauthorized: false } : false,
  max: config.maxConnections,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Export configuration for other modules
export const dbConfig = config;

// Pool connection event handlers
pool.on('connect', (client) => {
  console.log('🔗 New database client connected');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle database client:', err);
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🔄 Closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

export default pool; 