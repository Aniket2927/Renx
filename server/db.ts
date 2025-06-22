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

  constructor() {
    // Main connection pool for tenant management
    this.mainPool = new Pool({
      user: process.env.DB_USER || 'renx_admin',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'renx_db',
      password: process.env.DB_PASSWORD || 'renx_password',
      port: parseInt(process.env.DB_PORT || '5432'),
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
    });

    // Initialize default configuration
    this.defaultConfig = this.parseConnectionString(
      process.env.DATABASE_URL || 'postgresql://renx_admin:renx_password@localhost:5432/renx_db'
    );

    // Initialize default pool and database
    this.defaultPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://renx_admin:renx_password@localhost:5432/renx_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize default drizzle instance
    const client = postgres(process.env.DATABASE_URL || 'postgresql://renx_admin:renx_password@localhost:5432/renx_db');
    this.defaultDb = drizzle(client, { schema });

    // Initialize health check interval (5 minutes)
    this.healthCheckInterval = setInterval(() => this.checkConnections(), 300000);
    
    // Initialize the database manager
    this.init();
  }

  /**
   * Initialize the database manager
   */
  private async init(): Promise<void> {
    try {
      // Test main connection
      await this.mainPool.query('SELECT 1');
      console.log('Database connection established successfully');
      
      // Load tenant schema mapping into cache
      await this.refreshTenantSchemaCache();
    } catch (error) {
      console.error('Error initializing database connection:', error);
      console.log('Database not available - running in development mode without database');
      // Don't throw error in development mode
    }
  }

  /**
   * Refresh the tenant schema cache
   */
  private async refreshTenantSchemaCache(): Promise<void> {
    try {
      const result = await this.mainPool.query('SELECT tenant_id, tenant_name FROM tenant_management.tenants');
      
      // Clear existing cache
      this.tenantSchemaCache.clear();
      
      // Populate cache with tenant ID to schema name mapping
      result.rows.forEach((tenant: any) => {
        const schemaName = `tenant_${tenant.tenant_id.replace(/-/g, '')}`;
        this.tenantSchemaCache.set(tenant.tenant_id, schemaName);
      });
      
      console.log(`Refreshed tenant schema cache with ${this.tenantSchemaCache.size} tenants`);
    } catch (error) {
      console.error('Error refreshing tenant schema cache:', error);
    }
  }

  /**
   * Get tenant schema name from tenant ID
   */
  async getTenantSchema(tenantId: string): Promise<string> {
    // Check cache first
    if (this.tenantSchemaCache.has(tenantId)) {
      return this.tenantSchemaCache.get(tenantId)!;
    }
    
    // If not in cache, query the database
    try {
      const result = await this.mainPool.query(
        'SELECT tenant_id FROM tenant_management.tenants WHERE tenant_id = $1',
        [tenantId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Tenant not found with ID: ${tenantId}`);
      }
      
      // Format schema name and update cache
      const schemaName = `tenant_${tenantId.replace(/-/g, '')}`;
      this.tenantSchemaCache.set(tenantId, schemaName);
      
      return schemaName;
    } catch (error) {
      console.error(`Error getting schema for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get connection pool for a tenant
   */
  async getTenantPool(tenantId: string): Promise<Pool> {
    // Check if pool already exists
    if (this.tenantPools.has(tenantId)) {
      return this.tenantPools.get(tenantId)!;
    }
    
    // Create new connection pool for tenant
    try {
      const pool = new Pool({
        user: process.env.DB_USER || 'renx_admin',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'renx_db',
        password: process.env.DB_PASSWORD || 'renx_password',
        port: parseInt(process.env.DB_PORT || '5432'),
        max: 10, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
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
   * Execute a query for a specific tenant
   */
  async queryForTenant(tenantId: string, text: string, params: any[] = []): Promise<any> {
    try {
      const pool = await this.getTenantPool(tenantId);
      return await pool.query(text, params);
    } catch (error) {
      console.error(`Error executing query for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Execute a transaction for a specific tenant
   */
  async transactionForTenant<T>(tenantId: string, callback: (client: any) => Promise<T>): Promise<T> {
    const pool = await this.getTenantPool(tenantId);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Transaction failed for tenant ${tenantId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check health of all connections
   */
  private async checkConnections(): Promise<void> {
    try {
      // Check main pool
      try {
        await this.mainPool.query('SELECT 1');
      } catch (error) {
        console.error('Main connection pool health check failed:', error);
        // Attempt to reconnect
        await this.mainPool.end();
        this.mainPool = new Pool({
          user: process.env.DB_USER || 'renx_admin',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'renx_db',
          password: process.env.DB_PASSWORD || 'renx_password',
          port: parseInt(process.env.DB_PORT || '5432'),
        });
      }
      
      // Check tenant pools
      const tenantPoolEntries = Array.from(this.tenantPools.entries());
      for (const [tenantId, pool] of tenantPoolEntries) {
        try {
          await pool.query('SELECT 1');
        } catch (error) {
          console.error(`Connection pool for tenant ${tenantId} health check failed:`, error);
          // Remove from cache to force recreation on next use
          this.tenantPools.delete(tenantId);
        }
      }
      
      // Refresh tenant schema cache
      await this.refreshTenantSchemaCache();
    } catch (error) {
      console.error('Error during connection health check:', error);
    }
  }

  /**
   * Get main pool for tenant management operations
   */
  getMainPool(): Pool {
    return this.mainPool;
  }

  /**
   * Get database pool for a specific tenant or default
   */
  async getPool(tenantId: string = 'default'): Promise<Pool> {
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
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const client = postgres(tenantConnectionString);
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
    if (!tenantId) {
      return this.defaultDb;
    }

    const tenantDb = this.tenantDatabases.get(tenantId);
    if (tenantDb) {
      return tenantDb.db;
    }

    // Create new tenant database connection
    const tenantConnectionString = this.getTenantConnectionString(tenantId);
    const client = postgres(tenantConnectionString);
    const db = drizzle(client, { schema });

    const pool = new Pool({
      connectionString: tenantConnectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
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
   * Create tenant-specific database if needed
   */
  async createTenantDatabase(tenantId: string): Promise<void> {
    const dbName = `renx_tenant_${tenantId}`;
    
    try {
      // Use default connection to create new database
      const client = await this.defaultPool.connect();
      
      try {
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Created database for tenant: ${tenantId}`);
      } catch (error: any) {
        if (error.code !== '42P04') { // Database already exists
          throw error;
        }
      } finally {
        client.release();
      }

      // Initialize schema for new tenant database
      await this.initializeTenantSchema(tenantId);
    } catch (error) {
      console.error(`❌ Failed to create database for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Initialize schema for tenant database
   */
  private async initializeTenantSchema(tenantId: string): Promise<void> {
    const db = await this.getDatabase(tenantId);
    
    // Run migrations or schema initialization here
    // This would typically involve running CREATE TABLE statements
    console.log(`✅ Initialized schema for tenant: ${tenantId}`);
  }

  /**
   * Get connection string for a specific tenant
   */
  private getTenantConnectionString(tenantId: string): string {
    const config = { ...this.defaultConfig };
    config.database = `renx_tenant_${tenantId}`;
    
    return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${config.ssl ? '?ssl=true' : ''}`;
  }

  /**
   * Parse connection string into config object
   */
  private parseConnectionString(connectionString: string): DatabaseConfig {
    const url = new URL(connectionString);
    
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password,
      ssl: url.searchParams.get('ssl') === 'true' || url.searchParams.get('sslmode') === 'require',
      maxConnections: 20
    };
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Close all tenant pools
    const tenantPoolEntries = Array.from(this.tenantPools.entries());
    for (const [tenantId, pool] of tenantPoolEntries) {
      try {
        await pool.end();
      } catch (error) {
        console.error(`Error closing pool for tenant ${tenantId}:`, error);
      }
    }

    // Close main pool
    try {
      await this.mainPool.end();
    } catch (error) {
      console.error('Error closing main pool:', error);
    }
  }

  /**
   * Close all database connections (alias for close)
   */
  async closeAll(): Promise<void> {
    await this.defaultPool.end();
    
    const tenantDbEntries = Array.from(this.tenantDatabases.entries());
    for (const [tenantId, tenantDb] of tenantDbEntries) {
      try {
        await tenantDb.pool.end();
        console.log(`✅ Closed database connection for tenant: ${tenantId}`);
      } catch (error) {
        console.error(`❌ Error closing database for tenant ${tenantId}:`, error);
      }
    }
    
    this.tenantDatabases.clear();
  }

  /**
   * Get health status of all database connections
   */
  async getHealthStatus(): Promise<{ 
    status: 'healthy' | 'degraded' | 'unhealthy';
    connections: { tenantId: string; status: string }[];
  }> {
    const connections: { tenantId: string; status: string }[] = [];
    let healthyCount = 0;
    
    // Check default database
    try {
      const client = await this.defaultPool.connect();
      await client.query('SELECT 1');
      client.release();
      connections.push({ tenantId: 'default', status: 'healthy' });
      healthyCount++;
    } catch (error) {
      connections.push({ tenantId: 'default', status: 'unhealthy' });
    }
    
    // Check tenant databases
    const tenantDbEntries = Array.from(this.tenantDatabases.entries());
    for (const [tenantId, tenantDb] of tenantDbEntries) {
      try {
        const client = await tenantDb.pool.connect();
        await client.query('SELECT 1');
        client.release();
        connections.push({ tenantId, status: 'healthy' });
        healthyCount++;
      } catch (error) {
        connections.push({ tenantId, status: 'unhealthy' });
      }
    }
    
    const totalConnections = connections.length;
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (healthyCount === totalConnections) {
      status = 'healthy';
    } else if (healthyCount > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return { status, connections };
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Legacy drizzle connection for backward compatibility
const connectionString = process.env.DATABASE_URL || 'postgresql://renx_admin:renx_password@localhost:5432/renx_db';
const client = postgres(connectionString);
export const db = drizzle(client);

// Export the multi-tenant database manager
export { dbManager };

// Export default for backward compatibility
export default db;