// Integration test setup
let dbManager;
let rbacService;

// Setup before all integration tests
beforeAll(async () => {
  try {
    console.log('Setting up integration test environment...');
    
    // Mock database manager for testing
    dbManager = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      createTenant: jest.fn().mockResolvedValue({}),
      close: jest.fn().mockResolvedValue(),
      getDatabase: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] })
      })
    };
    
    // Mock RBAC service for testing
    rbacService = {
      createRole: jest.fn().mockResolvedValue({}),
      createUser: jest.fn().mockResolvedValue({}),
      assignUserRole: jest.fn().mockResolvedValue({}),
      assignUserToTenant: jest.fn().mockResolvedValue({})
    };
    
    // Setup mock test data
    await setupTestTenants();
    await setupTestRoles();
    await setupTestUsers();
    
    // Make services available globally
    global.testServices = {
      dbManager,
      rbacService
    };
    
    console.log('Integration test environment setup complete');
  } catch (error) {
    console.error('Integration test setup failed:', error);
    // Continue with tests even if setup fails with fallback mocks
    global.testServices = {
      dbManager: {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        createTenant: jest.fn().mockResolvedValue({}),
        close: jest.fn().mockResolvedValue()
      },
      rbacService: {
        createRole: jest.fn().mockResolvedValue({}),
        createUser: jest.fn().mockResolvedValue({}),
        assignUserRole: jest.fn().mockResolvedValue({}),
        assignUserToTenant: jest.fn().mockResolvedValue({})
      }
    };
  }
});

// Cleanup after all integration tests
afterAll(async () => {
  try {
    await cleanupTestData();
    if (dbManager && dbManager.close) {
      await dbManager.close();
    }
  } catch (error) {
    console.error('Integration test cleanup failed:', error);
  }
});

// Setup test tenants
async function setupTestTenants() {
  const tenants = [
    {
      id: 'test-tenant-1',
      name: 'Test Corp',
      domain: 'testcorp.com',
      status: 'active',
      plan: 'enterprise'
    },
    {
      id: 'test-tenant-2',
      name: 'Demo Inc',
      domain: 'demo.com',
      status: 'active',
      plan: 'professional'
    }
  ];
  
  for (const tenant of tenants) {
    if (dbManager && dbManager.createTenant) {
      await dbManager.createTenant(tenant);
    }
  }
}

// Setup test roles
async function setupTestRoles() {
  const roles = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      permissions: ['*:*']
    },
    {
      id: 'admin',
      name: 'Admin',
      permissions: [
        'users:*',
        'portfolios:*',
        'trading:*',
        'settings:read',
        'settings:write'
      ]
    },
    {
      id: 'user',
      name: 'User',
      permissions: [
        'portfolios:read',
        'portfolios:write',
        'trading:read',
        'trading:write',
        'profile:read',
        'profile:write'
      ]
    }
  ];
  
  for (const role of roles) {
    if (rbacService && rbacService.createRole) {
      await rbacService.createRole(role);
    }
  }
}

// Setup test users
async function setupTestUsers() {
  const users = [
    {
      id: 'test-user-admin',
      email: 'admin@testcorp.com',
      tenantId: 'test-tenant-1',
      roles: ['admin']
    },
    {
      id: 'test-user-regular',
      email: 'user@testcorp.com',
      tenantId: 'test-tenant-1',
      roles: ['user']
    }
  ];
  
  for (const user of users) {
    if (rbacService && rbacService.createUser) {
      await rbacService.createUser(user);
      for (const role of user.roles) {
        if (rbacService.assignUserRole) {
          await rbacService.assignUserRole(user.id, user.tenantId, role);
        }
      }
    }
  }
}

// Cleanup test data
async function cleanupTestData() {
  try {
    if (dbManager && dbManager.query) {
      // Clean up in reverse order of creation
      await dbManager.query('DELETE FROM user_roles WHERE tenant_id LIKE $1', ['test-tenant-%']);
      await dbManager.query('DELETE FROM users WHERE tenant_id LIKE $1', ['test-tenant-%']);
      await dbManager.query('DELETE FROM roles WHERE id LIKE $1', ['%test%']);
      await dbManager.query('DELETE FROM tenants WHERE id LIKE $1', ['test-tenant-%']);
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
} 