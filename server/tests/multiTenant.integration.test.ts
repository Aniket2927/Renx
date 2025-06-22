import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import jwt from 'jsonwebtoken';

describe('Multi-Tenant Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let tenant1Id: string;
  let tenant2Id: string;
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Create test tenants
    const tenant1Response = await request(app)
      .post('/api/admin/tenants')
      .send({
        name: 'Integration Test Corp',
        domain: 'integration-test.com',
        plan: 'enterprise'
      });
    tenant1Id = tenant1Response.body.tenant.id;

    const tenant2Response = await request(app)
      .post('/api/admin/tenants')
      .send({
        name: 'Integration Demo Inc',
        domain: 'integration-demo.com',
        plan: 'professional'
      });
    tenant2Id = tenant2Response.body.tenant.id;

    // Create test users
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@integration-test.com',
        password: 'TestPassword123!',
        tenantId: tenant1Id
      });
    userId1 = user1Response.body.user.id;

    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@integration-test.com',
        password: 'TestPassword123!',
        tenantId: tenant1Id
      });
    userId2 = user2Response.body.user.id;

    // Assign roles
    await global.testServices.rbacService.assignUserRole(userId1, tenant1Id, 'admin');
    await global.testServices.rbacService.assignUserRole(userId2, tenant1Id, 'user');

    // Generate tokens
    adminToken = jwt.sign(
      { userId: userId1, tenantId: tenant1Id, email: 'admin@integration-test.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { userId: userId2, tenantId: tenant1Id, email: 'user@integration-test.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup test data
    await global.testServices.dbManager.query('DELETE FROM user_roles WHERE tenant_id IN ($1, $2)', [tenant1Id, tenant2Id]);
    await global.testServices.dbManager.query('DELETE FROM users WHERE tenant_id IN ($1, $2)', [tenant1Id, tenant2Id]);
    await global.testServices.dbManager.query('DELETE FROM tenants WHERE id IN ($1, $2)', [tenant1Id, tenant2Id]);
  });

  describe('Tenant Isolation', () => {
    it('should isolate data between tenants', async () => {
      // Create portfolio for tenant 1
      const portfolio1Response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Portfolio 1',
          description: 'Portfolio for tenant 1'
        });

      expect(portfolio1Response.status).toBe(201);
      const portfolio1Id = portfolio1Response.body.portfolio.id;

      // Switch to tenant 2 context
      const tenant2Token = jwt.sign(
        { userId: userId1, tenantId: tenant2Id, email: 'admin@integration-test.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Try to access portfolio from tenant 2 - should fail
      const accessResponse = await request(app)
        .get(`/api/portfolios/${portfolio1Id}`)
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(accessResponse.status).toBe(404);

      // List portfolios from tenant 2 - should be empty
      const listResponse = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.portfolios).toHaveLength(0);
    });

    it('should prevent cross-tenant user access', async () => {
      // Try to get users from different tenant
      const tenant2Token = jwt.sign(
        { userId: userId1, tenantId: tenant2Id, email: 'admin@integration-test.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.users).toHaveLength(0);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce role-based permissions', async () => {
      // Admin should be able to create users
      const createUserResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@integration-test.com',
          password: 'TestPassword123!',
          roles: ['user']
        });

      expect(createUserResponse.status).toBe(201);

      // Regular user should not be able to create users
      const unauthorizedResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'anothernewuser@integration-test.com',
          password: 'TestPassword123!',
          roles: ['user']
        });

      expect(unauthorizedResponse.status).toBe(403);
    });

    it('should allow role-based resource access', async () => {
      // Both admin and user should access their own profile
      const adminProfileResponse = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminProfileResponse.status).toBe(200);
      expect(adminProfileResponse.body.user.id).toBe(userId1);

      const userProfileResponse = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.body.user.id).toBe(userId2);
    });

    it('should prevent access to admin-only resources', async () => {
      // User should not access admin endpoints
      const adminEndpointResponse = await request(app)
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${userToken}`);

      expect(adminEndpointResponse.status).toBe(403);

      // Admin should access admin endpoints
      const adminAccessResponse = await request(app)
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminAccessResponse.status).toBe(200);
    });
  });

  describe('Tenant Switching', () => {
    it('should allow authorized tenant switching', async () => {
      // First, grant user access to tenant 2
      await global.testServices.rbacService.assignUserToTenant(userId1, tenant2Id, ['user']);

      // Switch to tenant 2
      const switchResponse = await request(app)
        .post('/api/auth/switch-tenant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ tenantId: tenant2Id });

      expect(switchResponse.status).toBe(200);
      expect(switchResponse.body.tenantContext.tenant.id).toBe(tenant2Id);
      expect(switchResponse.body.userRoles).toContainEqual(
        expect.objectContaining({ name: 'User' })
      );
    });

    it('should prevent unauthorized tenant switching', async () => {
      // Try to switch to tenant user has no access to
      const unauthorizedSwitchResponse = await request(app)
        .post('/api/auth/switch-tenant')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ tenantId: tenant2Id });

      expect(unauthorizedSwitchResponse.status).toBe(403);
    });
  });

  describe('Multi-Tenant API Endpoints', () => {
    it('should handle portfolio operations within tenant context', async () => {
      // Create portfolio
      const createResponse = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Integration Test Portfolio',
          description: 'Test portfolio for integration testing'
        });

      expect(createResponse.status).toBe(201);
      const portfolioId = createResponse.body.portfolio.id;

      // Add holdings
      const addHoldingResponse = await request(app)
        .post(`/api/portfolios/${portfolioId}/holdings`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          symbol: 'AAPL',
          shares: 100,
          averagePrice: 150.00
        });

      expect(addHoldingResponse.status).toBe(201);

      // Get portfolio with holdings
      const getResponse = await request(app)
        .get(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.portfolio.holdings).toHaveLength(1);
      expect(getResponse.body.portfolio.holdings[0].symbol).toBe('AAPL');
    });

    it('should handle trading operations within tenant context', async () => {
      // Create a trade
      const tradeResponse = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          symbol: 'GOOGL',
          type: 'buy',
          quantity: 10,
          price: 2500.00
        });

      expect(tradeResponse.status).toBe(201);
      const tradeId = tradeResponse.body.trade.id;

      // Get trade history
      const historyResponse = await request(app)
        .get('/api/trades')
        .set('Authorization', `Bearer ${userToken}`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.trades).toContainEqual(
        expect.objectContaining({
          id: tradeId,
          symbol: 'GOOGL',
          type: 'buy'
        })
      );
    });
  });

  describe('AI Service Integration', () => {
    it('should provide tenant-specific AI analysis', async () => {
      // Create portfolio for analysis
      const portfolioResponse = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'AI Analysis Portfolio',
          description: 'Portfolio for AI analysis testing'
        });

      const portfolioId = portfolioResponse.body.portfolio.id;

      // Add some holdings
      await request(app)
        .post(`/api/portfolios/${portfolioId}/holdings`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          symbol: 'AAPL',
          shares: 50,
          averagePrice: 150.00
        });

      await request(app)
        .post(`/api/portfolios/${portfolioId}/holdings`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          symbol: 'GOOGL',
          shares: 20,
          averagePrice: 2500.00
        });

      // Request AI analysis
      const analysisResponse = await request(app)
        .post(`/api/ai/analyze-portfolio`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ portfolioId });

      expect(analysisResponse.status).toBe(200);
      expect(analysisResponse.body.analysis).toHaveProperty('risk_score');
      expect(analysisResponse.body.analysis).toHaveProperty('recommendations');
    });
  });

  describe('Notification System Integration', () => {
    it('should send tenant-specific notifications', async () => {
      // Create a price alert
      const alertResponse = await request(app)
        .post('/api/notifications/alerts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          symbol: 'AAPL',
          condition: 'above',
          price: 160.00,
          enabled: true
        });

      expect(alertResponse.status).toBe(201);

      // Simulate price change triggering alert
      const triggerResponse = await request(app)
        .post('/api/notifications/trigger-alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          symbol: 'AAPL',
          currentPrice: 165.00
        });

      expect(triggerResponse.status).toBe(200);
      expect(triggerResponse.body.alertsTriggered).toBeGreaterThan(0);
    });
  });

  describe('Audit Logging', () => {
    it('should log tenant-specific actions', async () => {
      // Perform some actions
      await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Audit Test Portfolio',
          description: 'Portfolio for audit testing'
        });

      // Check audit logs
      const auditResponse = await request(app)
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ limit: 10 });

      expect(auditResponse.status).toBe(200);
      expect(auditResponse.body.logs).toContainEqual(
        expect.objectContaining({
          action: 'portfolio.create',
          tenantId: tenant1Id,
          userId: userId1
        })
      );
    });
  });

  describe('Performance Under Load', () => {
    it('should handle concurrent tenant operations', async () => {
      const promises: Promise<any>[] = [];
      
      // Create multiple concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/portfolios')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              name: `Concurrent Portfolio ${i}`,
              description: `Portfolio ${i} for concurrent testing`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all portfolios were created
      const listResponse = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.body.portfolios.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database failures
      // For now, test general error responses
      const invalidResponse = await request(app)
        .get('/api/portfolios/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(invalidResponse.status).toBe(404);
      expect(invalidResponse.body).toHaveProperty('error');
    });

    it('should handle malformed requests', async () => {
      const malformedResponse = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          description: 'Portfolio without name'
        });

      expect(malformedResponse.status).toBe(400);
      expect(malformedResponse.body).toHaveProperty('error');
    });
  });
}); 