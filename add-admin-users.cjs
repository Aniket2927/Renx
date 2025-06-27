const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function addAdminUsers() {
  const client = new Client({
    user: 'renx_admin',
    host: 'localhost',
    database: 'renx_db',
    password: 'renx_password',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash the password admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Admin users to create
    const adminUsers = [
      {
        username: 'admin',
        email: 'admin@renx.ai',
        first_name: 'Primary',
        last_name: 'Admin',
        role: 'admin'
      },
      {
        username: 'demo_admin',
        email: 'demo@renx.ai',
        first_name: 'Demo',
        last_name: 'Admin',
        role: 'admin'
      },
      {
        username: 'superadmin',
        email: 'superadmin@renx.ai',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin'
      }
    ];

    for (const user of adminUsers) {
      const query = `
        INSERT INTO tenant_demo_tenant.users (username, email, password, first_name, last_name, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          updated_at = NOW()
        RETURNING id, username, email, role;
      `;
      
      const result = await client.query(query, [
        user.username,
        user.email,
        hashedPassword,
        user.first_name,
        user.last_name,
        user.role
      ]);
      
      console.log('Created/Updated user:', result.rows[0]);
    }

    // Show all users
    const allUsers = await client.query('SELECT id, username, email, first_name, last_name, role, status FROM tenant_demo_tenant.users ORDER BY id;');
    console.log('\nAll users in database:');
    console.table(allUsers.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addAdminUsers(); 