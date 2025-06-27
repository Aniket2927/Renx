import { Pool, Client } from 'pg';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

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

// Tenant database interface
interface TenantDatabase {
  tenantId: string;
  connectionString: string;
  pool: Pool;
  db: ReturnType<typeof drizzle>;
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

// Multi-Tenant Database Manager
class DatabaseManager {
  private mainPool: Pool;
  private tenantPools: Map<string, Pool> = new Map();
  private tenantSchemaCache: Map<string, string> = new Map();
  private healthCheckInterval: NodeJS.Timeout;
  private tenantDatabases: Map<string, TenantDatabase> = new Map();
  private defaultConfig: DatabaseConfig;
  private defaultPool: Pool;
  private defaultDb: ReturnType<typeof drizzle>;
  private isInitialized = false;

  constructor() {
    // Get standardized database configuration
    this.defaultConfig = getDatabaseConfig();
    
    console.log('🗄️  Initializing Database Manager with configuration:');
    console.log(`   Host: ${this.defaultConfig.host}:${this.defaultConfig.port}`);
    console.log(`   Database: ${this.defaultConfig.database}`);
    console.log(`   User: ${this.defaultConfig.username}`);
    console.log(`   SSL: ${this.defaultConfig.ssl}`);
    console.log(`   Max Connections: ${this.defaultConfig.maxConnections}`);

    // Create connection string from config
    const connectionString = this.buildConnectionString(this.defaultConfig);
    
    // Main connection pool for tenant management
    this.mainPool = new Pool({
      user: this.defaultConfig.username,
      host: this.defaultConfig.host,
      database: this.defaultConfig.database,
      password: this.defaultConfig.password,
      port: this.defaultConfig.port,
      ssl: this.defaultConfig.ssl,
      max: this.defaultConfig.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Initialize default pool
    this.defaultPool = new Pool({
      connectionString,
      max: this.defaultConfig.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false
    });

    // Initialize default drizzle instance
    const client = postgres(connectionString, {
      ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false,
      max: this.defaultConfig.maxConnections,
      idle_timeout: 30,
      connect_timeout: 5
    });
    this.defaultDb = drizzle(client, { schema });

    // Initialize health check interval (5 minutes)
    this.healthCheckInterval = setInterval(() => this.checkConnections(), 300000);
    
    // Initialize the database manager
    this.init();
  }

  /**
   * Build connection string from config
   */
  private buildConnectionString(config: DatabaseConfig): string {
    const sslParam = config.ssl ? '?ssl=true' : '';
    return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${sslParam}`;
  }

  /**
   * Initialize database manager
   */
  async init() {
    try {
      console.log('🔄 Testing database connection...');
      
      // Test connection
      const client = await this.defaultPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ Database connection successful');
      
      // Initialize tenant management schema
      await this.initializeTenantManagement();
      
      this.isInitialized = true;
      console.log('🎉 Database Manager initialized successfully');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      console.error('🔧 Please check your database configuration and ensure PostgreSQL is running');
      
      // Don't throw error to allow application to continue with limited functionality
      console.log('⚠️  Application will continue with limited database functionality');
    }
  }

  /**
   * Initialize tenant management schema
   */
  private async initializeTenantManagement() {
    try {
      const client = await this.defaultPool.connect();
      
      // Try to create tenants table - if permission denied, skip but continue
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS tenants (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            schema_name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN DEFAULT true
          )
        `);
        
        // Create default tenant if it doesn't exist
        await client.query(`
          INSERT INTO tenants (id, name, schema_name) 
          VALUES ('default', 'Default Tenant', 'public')
          ON CONFLICT (id) DO NOTHING
        `);
        
        console.log('✅ Tenant management schema initialized');
      } catch (schemaError: any) {
        if (schemaError.code === '42501') { // Permission denied
          console.log('⚠️  Tenant management schema creation skipped (insufficient permissions)');
          console.log('   Application will use default schema without tenant isolation');
        } else {
          throw schemaError; // Re-throw if it's not a permission error
        }
      }
      
      client.release();
      
    } catch (error) {
      console.error('❌ Failed to initialize tenant management:', error);
      // Don't throw error - allow application to continue
      console.log('⚠️  Continuing without tenant management features');
    }
  }

  /**
   * Get tenant schema name
   */
  private async getTenantSchema(tenantId: string): Promise<string> {
    if (this.tenantSchemaCache.has(tenantId)) {
      return this.tenantSchemaCache.get(tenantId)!;
    }
    
    try {
      const client = await this.mainPool.connect();
      const result = await client.query(
        'SELECT schema_name FROM tenants WHERE id = $1 AND active = true',
        [tenantId]
      );
      client.release();
      
      if (result.rows.length === 0) {
        throw new Error(`Tenant ${tenantId} not found or inactive`);
      }
      
      const schemaName = result.rows[0].schema_name;
      this.tenantSchemaCache.set(tenantId, schemaName);
      return schemaName;
      
    } catch (error) {
      console.error(`Error getting tenant schema for ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get connection pool for a tenant
   */
  async getTenantPool(tenantId: string): Promise<Pool> {
    if (!this.isInitialized) {
      throw new Error('Database Manager not initialized');
    }
    
    // Check if pool already exists
    if (this.tenantPools.has(tenantId)) {
      return this.tenantPools.get(tenantId)!;
    }
    
    // Create new connection pool for tenant
    try {
      const pool = new Pool({
        user: this.defaultConfig.username,
        host: this.defaultConfig.host,
        database: this.defaultConfig.database,
        password: this.defaultConfig.password,
        port: this.defaultConfig.port,
        ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false,
        max: Math.min(10, this.defaultConfig.maxConnections), // Limit tenant pools
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      
      // Get schema name
      const schemaName = await this.getTenantSchema(tenantId);
      
      // Set search path for all connections in this pool
      pool.on('connect', (client) => {
        client.query(`SET search_path TO ${schemaName}, public`);
      });
      
      // Store pool in cache
      this.tenantPools.set(tenantId, pool);
      
      return pool;
    } catch (error) {
      console.error(`Error creating connection pool for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new tenant
   */
  async createTenant(tenantId: string, tenantName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Database Manager not initialized');
    }
    
    const client = await this.mainPool.connect();
    
    try {
      await client.query('BEGIN');
      
      const schemaName = `tenant_${tenantId}`;
      
      // Create tenant record
      await client.query(
        'INSERT INTO tenants (id, name, schema_name) VALUES ($1, $2, $3)',
        [tenantId, tenantName, schemaName]
      );
      
      // Create schema
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
      
      await client.query('COMMIT');
      
      // Clear cache
      this.tenantSchemaCache.delete(tenantId);
      
      console.log(`✅ Tenant ${tenantId} created successfully`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error creating tenant ${tenantId}:`, error);
      throw error;
      
    } finally {
      client.release();
    }
  }

  /**
   * Get database pool for a specific tenant or default
   */
  async getPool(tenantId: string = 'default'): Promise<Pool> {
    if (!this.isInitialized) {
      throw new Error('Database Manager not initialized');
    }
    
    if (tenantId === 'default' || tenantId === 'tenant_management') {
      return this.defaultPool;
    }

    const tenantDb = this.tenantDatabases.get(tenantId);
    if (tenantDb) {
      return tenantDb.pool;
    }

    // Create new tenant database connection if not exists
    const tenantConnectionString = this.getTenantConnectionString(tenantId);
    const pool = new Pool({
      connectionString: tenantConnectionString,
      max: Math.min(10, this.defaultConfig.maxConnections),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false
    });

    const client = postgres(tenantConnectionString, {
      ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false,
      max: Math.min(10, this.defaultConfig.maxConnections),
      idle_timeout: 30,
      connect_timeout: 5
    });
    const db = drizzle(client, { schema });

    this.tenantDatabases.set(tenantId, {
      tenantId,
      connectionString: tenantConnectionString,
      pool,
      db
    });

    return pool;
  }

  /**
   * Get drizzle database instance for a tenant
   */
  async getDatabase(tenantId?: string): Promise<ReturnType<typeof drizzle>> {
    if (!this.isInitialized) {
      throw new Error('Database Manager not initialized');
    }
    
    if (!tenantId) {
      return this.defaultDb;
    }

    const tenantDb = this.tenantDatabases.get(tenantId);
    if (tenantDb) {
      return tenantDb.db;
    }

    // Create new tenant database connection
    const tenantConnectionString = this.getTenantConnectionString(tenantId);
    const client = postgres(tenantConnectionString, {
      ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false,
      max: Math.min(10, this.defaultConfig.maxConnections),
      idle_timeout: 30,
      connect_timeout: 5
    });
    const db = drizzle(client, { schema });

    const pool = new Pool({
      connectionString: tenantConnectionString,
      max: Math.min(10, this.defaultConfig.maxConnections),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: this.defaultConfig.ssl ? { rejectUnauthorized: false } : false
    });

    this.tenantDatabases.set(tenantId, {
      tenantId,
      connectionString: tenantConnectionString,
      pool,
      db
    });

    return db;
  }

  /**
   * Get connection string for a specific tenant
   */
  private getTenantConnectionString(tenantId: string): string {
    const config = { ...this.defaultConfig };
    config.database = `renx_tenant_${tenantId}`;
    
    return this.buildConnectionString(config);
  }

  /**
   * Health check for all connections
   */
  private async checkConnections() {
    if (!this.isInitialized) return;
    
    try {
      // Check main pool
      const client = await this.defaultPool.connect();
      await client.query('SELECT 1');
      client.release();
      
      // Check tenant pools
      for (const [tenantId, pool] of Array.from(this.tenantPools.entries())) {
        try {
          const tenantClient = await pool.connect();
          await tenantClient.query('SELECT 1');
          tenantClient.release();
        } catch (error) {
          console.error(`Health check failed for tenant ${tenantId}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Main database health check failed:', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      config: {
        host: this.defaultConfig.host,
        port: this.defaultConfig.port,
        database: this.defaultConfig.database,
        ssl: this.defaultConfig.ssl
      },
      pools: {
        main: this.mainPool.totalCount,
        default: this.defaultPool.totalCount,
        tenants: this.tenantPools.size
      }
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🔄 Shutting down Database Manager...');
    
    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Close all pools
    await Promise.all([
      this.mainPool.end(),
      this.defaultPool.end(),
      ...Array.from(this.tenantPools.values()).map(pool => pool.end()),
      ...Array.from(this.tenantDatabases.values()).map(db => db.pool.end())
    ]);
    
    console.log('✅ Database Manager shutdown complete');
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Legacy drizzle connection for backward compatibility
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${getEnvVar('DB_USER', 'renx_admin')}:${getEnvVar('DB_PASSWORD', 'renx_password')}@${getEnvVar('DB_HOST', 'localhost')}:${getEnvVar('DB_PORT', '5432')}/${getEnvVar('DB_NAME', 'renx_db')}`;

const client = postgres(connectionString, {
  ssl: getEnvVar('DB_SSL', 'false').toLowerCase() === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(getEnvVar('DB_MAX_CONNECTIONS', '20')),
  idle_timeout: 30,
  connect_timeout: 5
});

export const db = drizzle(client, { schema });

// Export database manager and utilities
export { dbManager, DatabaseManager, type DatabaseConfig, type TenantDatabase };
export default dbManager;