import { dbManager } from '../server/db';
import bcrypt from 'bcrypt';

async function initializeDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test main connection
    const result = await dbManager.getMainPool().query('SELECT NOW()');
    console.log('Database connected at:', result.rows[0].now);
    
    // Create tenant management schema if it doesn't exist
    await dbManager.getMainPool().query(`
      CREATE SCHEMA IF NOT EXISTS tenant_management;
    `);
    
    // Create tenants table
    await dbManager.getMainPool().query(`
      CREATE TABLE IF NOT EXISTS tenant_management.tenants (
        tenant_id VARCHAR(255) PRIMARY KEY,
        tenant_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Insert demo tenant if it doesn't exist
    await dbManager.getMainPool().query(`
      INSERT INTO tenant_management.tenants (tenant_id, tenant_name, status)
      VALUES ('demo_tenant', 'Demo Tenant', 'active')
      ON CONFLICT (tenant_id) DO NOTHING;
    `);
    
    console.log('Tenant management setup complete');
    
    // Create demo tenant schema
    await dbManager.getMainPool().query(`
      CREATE SCHEMA IF NOT EXISTS tenant_demo_tenant;
    `);
    
    // Create users table in demo tenant schema
    await dbManager.getMainPool().query(`
      CREATE TABLE IF NOT EXISTS tenant_demo_tenant.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create demo users
    const demoUsers = [
      {
        username: 'demo_user',
        email: 'demo@renx.ai',
        password: await bcrypt.hash('demo123', 10),
        first_name: 'Demo',
        last_name: 'User',
        role: 'admin'
      },
      {
        username: 'test_trader',
        email: 'trader@renx.ai',
        password: await bcrypt.hash('trader123', 10),
        first_name: 'Test',
        last_name: 'Trader',
        role: 'user'
      }
    ];
    
    for (const user of demoUsers) {
      await dbManager.getMainPool().query(`
        INSERT INTO tenant_demo_tenant.users (username, email, password, first_name, last_name, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          updated_at = NOW();
      `, [user.username, user.email, user.password, user.first_name, user.last_name, user.role]);
    }
    
    console.log('Demo users created successfully');
    
    // Show created users
    const users = await dbManager.getMainPool().query(`
      SELECT id, username, email, first_name, last_name, role, status, created_at
      FROM tenant_demo_tenant.users;
    `);
    
    console.log('Created users:', users.rows);
    
    // Create sessions table for auth
    await dbManager.getMainPool().query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      ) WITH (OIDS=FALSE);
      
      ALTER TABLE sessions DROP CONSTRAINT IF EXISTS session_pkey;
      ALTER TABLE sessions ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);
    
    console.log('Sessions table created');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
  
  process.exit(0);
}

initializeDatabase(); 