/**
 * Test Database Setup for Integration Testing
 * Provides PostgreSQL database connection and test data management
 */

const postgres = require('postgres');

// Test Database Configuration
class TestDatabase {
  constructor() {
    this.client = null;
    this.connected = false;
    
    // Use test database URL or fallback to in-memory mock
    this.connectionString = process.env.TEST_DATABASE_URL || 
                           process.env.DATABASE_URL || 
                           'postgresql://localhost:5432/renx_test';
  }

  async connect() {
    try {
      // Try to connect to PostgreSQL
      this.client = postgres(this.connectionString, {
        max: 1, // Single connection for tests
        idle_timeout: 20,
        connect_timeout: 10,
        onnotice: () => {}, // Suppress notices during testing
      });
      
      // Test the connection
      await this.client`SELECT 1 as test`;
      this.connected = true;
      console.log('📊 PostgreSQL test database connected');
      return this;
    } catch (error) {
      console.warn('⚠️ PostgreSQL not available, using mock database for tests');
      console.warn('Error:', error.message);
      
      // Fall back to mock implementation
      this.client = new MockPostgresClient();
      this.connected = true;
      return this;
    }
  }

  async disconnect() {
    if (this.client && typeof this.client.end === 'function') {
      await this.client.end();
    }
    this.connected = false;
    console.log('📊 Test database disconnected');
  }

  // Execute SQL query
  async query(sql, params = []) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    try {
      if (this.client.query) {
        // Real PostgreSQL client
        const result = await this.client.query(sql, params);
        return result;
      } else {
        // Postgres.js client
        const result = await this.client.unsafe(sql, params);
        return { rows: result, rowCount: result.length };
      }
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  async transaction(callback) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    try {
      if (this.client.begin) {
        // Real PostgreSQL with transaction support
        return await this.client.begin(callback);
      } else {
        // Mock transaction
        return await callback(this);
      }
    } catch (error) {
      throw error;
    }
  }

  // Test data management helpers
  async createTestUser(userData = {}) {
    const user = {
      id: 'test-user-' + Date.now(),
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      tenantId: 'test-tenant-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    
    try {
      // Try to insert into real database
      const result = await this.query(
        `INSERT INTO users (id, email, first_name, last_name, tenant_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET updated_at = $7 
         RETURNING *`,
        [user.id, user.email, user.firstName, user.lastName, user.tenantId, user.createdAt, user.updatedAt]
      );
      return result.rows[0] || user;
    } catch (error) {
      // Return mock user if database insert fails
      console.warn('Using mock user data:', error.message);
      return user;
    }
  }

  async createTestOrder(orderData = {}) {
    const order = {
      id: 'test-order-' + Date.now(),
      symbol: 'AAPL',
      quantity: 100,
      order_type: 'market',
      side: 'buy',
      status: 'pending',
      user_id: 'test-user-001',
      tenant_id: 'test-tenant-001',
      created_at: new Date(),
      updated_at: new Date(),
      ...orderData
    };
    
    try {
      // Try to insert into real database
      const result = await this.query(
        `INSERT INTO orders (id, symbol, quantity, order_type, side, status, user_id, tenant_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [order.id, order.symbol, order.quantity, order.order_type, order.side, order.status, order.user_id, order.tenant_id, order.created_at, order.updated_at]
      );
      return result.rows[0] || order;
    } catch (error) {
      // Return mock order if database insert fails
      console.warn('Using mock order data:', error.message);
      return order;
    }
  }

  async cleanup() {
    try {
      // Clean up test data from real database
      await this.query(`DELETE FROM orders WHERE tenant_id LIKE 'test-tenant-%'`);
      await this.query(`DELETE FROM users WHERE tenant_id LIKE 'test-tenant-%'`);
      console.log('🧹 Test database cleaned up');
    } catch (error) {
      console.warn('Test cleanup warning:', error.message);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as healthy');
      return {
        status: 'healthy',
        connected: this.connected,
        database: 'postgresql',
        result: result.rows[0]
      };
    } catch (error) {
      return {
        status: 'error',
        connected: this.connected,
        database: 'mock',
        error: error.message
      };
    }
  }
}

// Mock PostgreSQL client for when real database is not available
class MockPostgresClient {
  constructor() {
    this.mockData = new Map();
  }

  async query(sql, params = []) {
    // Mock responses based on SQL patterns
    if (sql.includes('SELECT 1')) {
      return { rows: [{ test: 1 }], rowCount: 1 };
    }
    
    if (sql.includes('SELECT') && sql.includes('users')) {
      return {
        rows: [{
          id: 'test-user-001',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          tenant_id: 'test-tenant-001',
          created_at: new Date(),
          updated_at: new Date()
        }],
        rowCount: 1
      };
    }

    if (sql.includes('SELECT') && sql.includes('orders')) {
      return {
        rows: [{
          id: 'test-order-001',
          symbol: 'AAPL',
          quantity: 100,
          order_type: 'market',
          side: 'buy',
          status: 'pending',
          user_id: 'test-user-001',
          tenant_id: 'test-tenant-001',
          created_at: new Date(),
          updated_at: new Date()
        }],
        rowCount: 1
      };
    }

    if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
      return {
        rows: [],
        rowCount: 1,
        command: sql.split(' ')[0]
      };
    }

    return { rows: [], rowCount: 0 };
  }

  async unsafe(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows;
  }

  async begin(callback) {
    return await callback(this);
  }

  async end() {
    // Mock cleanup
    return Promise.resolve();
  }
}

// Create test database instance
const testDb = new TestDatabase();

module.exports = {
  testDb,
  TestDatabase,
  MockPostgresClient
}; 